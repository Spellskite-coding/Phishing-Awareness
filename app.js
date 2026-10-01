/*
 * Phishing-Awareness — SMS & WhatsApp
 *
 * GARANTIE DE SÉCURITÉ : ce script ne contient aucun vrai lien, n'ouvre
 * aucune page, n'envoie aucun message et n'accède à rien sur l'appareil.
 * Toutes les adresses affichées sont fausses et inertes (de simples
 * <span>). Les boutons ne font qu'afficher un message de sensibilisation.
 */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------
     Les six leviers psychologiques
     --------------------------------------------------------- */
  var LEVIERS = {
    peur:      { nom: 'La peur',        icone: '😨', exemple: '« Connexion inhabituelle à votre compte », « virus détecté sur votre téléphone ».', reflexe: 'La peur est justement l\'outil de l\'attaquant. <strong>On se calme et on vérifie soi-même</strong>, sans cliquer.' },
    urgence:   { nom: 'L\'urgence',      icone: '⏰', exemple: '« Vous avez 24 h », « dernier avertissement », « votre colis sera détruit ».', reflexe: 'Un vrai organisme ne vide jamais un dossier en 24 h par SMS. <strong>Prendre le temps, c\'est déjà déjouer le piège.</strong>' },
    argent:    { nom: 'L\'argent',       icone: '💸', exemple: '« Abonnement renouvelé 59,99 € — annulez ici », « remboursement de 148 € en attente ».', reflexe: 'On veut annuler ou récupérer l\'argent, donc on se précipite. <strong>On vérifie dans l\'appli officielle</strong> : souvent, il n\'y a rien à annuler.' },
    curiosite: { nom: 'La curiosité',    icone: '👀', exemple: '« Regarde cette photo de toi 😳 », « un document a été partagé avec vous ».', reflexe: 'La curiosité pousse à ouvrir le lien ou le fichier. <strong>On ne clique pas sur l\'inattendu</strong>, même venant d\'un proche.' },
    autorite:  { nom: 'L\'autorité',     icone: '🏛️', exemple: 'Un message « des impôts », « de la police », « de votre banque », « de votre patron ».', reflexe: 'Un nom connu ne prouve rien : l\'expéditeur s\'usurpe en une seconde. <strong>On passe par le canal officiel</strong> qu\'on connaît déjà.' },
    confiance: { nom: 'La confiance',    icone: '🤝', exemple: '« Coucou maman, c\'est mon nouveau numéro », « ton ami a aimé cette page ».', reflexe: 'On fait confiance à un proche ou à « tout le monde ». <strong>On vérifie que c\'est bien la personne</strong> par un autre moyen.' }
  };
  function nomLevier(k) { return LEVIERS[k] ? LEVIERS[k].nom : k; }

  /* ---------------------------------------------------------
     Petits fragments réutilisables
     --------------------------------------------------------- */
  function lien(url) { return '<span class="lien-msg" data-piege role="link" tabindex="0">' + url + '</span>'; }
  function apercu(icone, titre, url) {
    return '<span class="apercu-lien" data-piege role="link" tabindex="0">' +
      '<span class="al-image" aria-hidden="true">' + icone + '</span>' +
      '<span class="al-texte"><span class="al-titre">' + titre + '</span><span class="al-url">' + url + '</span></span></span>';
  }

  /* ---------------------------------------------------------
     Les messages, inspirés de campagnes réelles en France.
     difficulte : 1 grossier · 2 crédible · 3 écrit par IA · 4 ciblé/avancé
     type : 'piege' ou 'legit'
     --------------------------------------------------------- */
  var SCENARIOS = [
    /* ===================== SMS ===================== */
    {
      id: 'sms-colis', app: 'sms', difficulte: 1, type: 'piege',
      exp: '+33 7 55 10 22 84', avatar: '?', couleur: '#8A8A8E', statut: 'SMS / MMS',
      apercu: 'VOTRE COLI EST BLOQUER en douane, régler 1.99€ de frais...',
      fil: [
        { sens: 'recu', texte: 'VOTRE COLI EST BLOQUER en douane. Pour la livraison régler 1.99€ de frais ici : ' + lien('la-poste-suivi-colis.info/regul'), heure: '09:12' }
      ],
      leviers: ['urgence', 'argent'],
      explication: 'Ce faux SMS imite La Poste. Les fautes (« coli », « bloquer »), l\'expéditeur qui est un numéro de portable et la petite somme à payer sont typiques. Le vrai but n\'est pas le 1,99 € : c\'est de récupérer votre numéro de carte sur la fausse page de paiement.',
      indice: 'La Poste, Chronopost et les douanes ne demandent jamais de payer des frais par SMS avec un lien. Et l\'adresse n\'est pas laposte.fr, mais « la-poste-suivi-colis.info ».'
    },
    {
      id: 'sms-amende', app: 'sms', difficulte: 2, type: 'piege',
      exp: 'ANTAI-Gouv', avatar: '!', couleur: '#5A6478', statut: 'SMS',
      apercu: 'Il vous reste une amende impayée. Sans règlement sous 48h, majoration...',
      fil: [
        { sens: 'recu', texte: 'Il vous reste une amende impayée d\'un montant de 35€. Sans règlement sous 48h, une majoration à 375€ sera appliquée. Réglez ici : ' + lien('antai-amendes.gouv-paiement.com'), heure: '14:03' }
      ],
      leviers: ['peur', 'autorite', 'urgence'],
      explication: 'Il joue sur la peur du gendarme et la majoration qui grimpe. L\'expéditeur affiche un nom officiel, mais n\'importe qui peut écrire « ANTAI-Gouv » comme nom d\'expéditeur. La vraie page (antai.gouv.fr) n\'a pas de bout ajouté après « .gouv ».',
      indice: 'Le seul vrai domaine officiel finit par « .gouv.fr ». Ici « gouv-paiement.com » est un site privé déguisé : le vrai nom est « gouv-paiement.com », pas antai.gouv.fr.'
    },
    {
      id: 'sms-code', app: 'sms', difficulte: 1, type: 'legit',
      exp: '32665', avatar: '✓', couleur: '#1E7B4F', statut: 'SMS',
      apercu: 'Votre code de connexion est 483920. Ne le communiquez à personne.',
      fil: [
        { sens: 'recu', texte: 'Votre code de connexion est 483920. Il expire dans 5 minutes. Ne le communiquez à personne.', heure: '18:47' }
      ],
      explication: 'Ça, c\'est un vrai message : un code de connexion que vous avez demandé en vous connectant. Il ne contient aucun lien et ne vous demande rien. Le piège n\'est pas le SMS : c\'est quand quelqu\'un vous appelle juste après en se faisant passer pour votre banque et vous demande ce code. Ne le donnez jamais.',
      indice: 'Un vrai code de sécurité n\'a jamais de lien et ne vous demande jamais de rappeler. Personne de légitime ne vous demandera de le lui communiquer.'
    },
    {
      id: 'sms-banque', app: 'sms', difficulte: 3, type: 'piege',
      exp: '38228', avatar: '€', couleur: '#14213D', statut: 'SMS',
      apercu: 'Un paiement de 429,00€ vient d\'être initié depuis votre espace...',
      fil: [
        { sens: 'recu', texte: 'Un paiement de 429,00€ vient d\'être initié depuis votre espace client. Si vous n\'êtes pas à l\'origine de cette opération, signalez-la immédiatement : ' + lien('securite-clients-banque.fr/opposition'), heure: '21:05' }
      ],
      leviers: ['peur', 'urgence', 'autorite'],
      explication: 'Aucune faute, un ton sérieux : ce SMS est crédible. Il joue sur la peur de perdre 429 €, qui pousse à cliquer sans réfléchir. Le lien mène à une fausse page de banque qui capture vos identifiants. Souvent, un « conseiller » vous appelle ensuite pour vous « aider » à sécuriser le compte : c\'est le même escroc.',
      indice: 'Votre banque ne met jamais de lien pour « signaler » une fraude. Le bon geste : ouvrir vous-même l\'appli de la banque ou appeler le numéro au dos de la carte.'
    },
    {
      id: 'sms-chronopost', app: 'sms', difficulte: 3, type: 'piege',
      exp: '+33 6 44 91 08 12', avatar: '📦', couleur: '#5A6478', statut: 'SMS',
      apercu: 'Bonjour, votre colis n\'a pas pu être livré (adresse incomplète)...',
      fil: [
        { sens: 'recu', texte: 'Bonjour, votre colis Chronopost n\'a pas pu être livré : adresse incomplète. Merci de confirmer vos informations pour une nouvelle livraison : ' + lien('chronopost.fr-suivi.livraison-info.com'), heure: '11:38' }
      ],
      leviers: ['urgence', 'curiosite', 'autorite'],
      explication: 'Celui-ci est fort parce qu\'il tombe juste quand vous attendez vraiment un colis. Pas de faute, le nom Chronopost est présent, et « adresse incomplète » semble plausible. Mais le vrai site est « livraison-info.com », pas chronopost.fr : le début « chronopost.fr- » n\'est là que pour vous rassurer.',
      indice: 'Lisez l\'adresse jusqu\'au premier « / » : le vrai site est le nom juste avant, ici « livraison-info.com ». Dans le doute, tapez vous-même chronopost.fr et entrez votre numéro de suivi.'
    },
    {
      id: 'sms-spoof', app: 'sms', difficulte: 4, type: 'piege',
      exp: 'Impots', avatar: '€', couleur: '#14213D', statut: 'SMS',
      fil: [
        { sens: 'recu', texte: 'Votre avis d\'impôt est disponible dans votre espace particulier.', heure: 'lun. 09:30', vrai: true },
        { sens: 'recu', texte: 'Un trop-perçu de 296€ vous est dû. Renseignez votre RIB pour recevoir le remboursement avant le 30/09 : ' + lien('impots.gouv.fr-remboursement.net'), heure: '16:22' }
      ],
      apercu: '2 messages · le dernier réclame votre RIB pour un « remboursement »',
      leviers: ['argent', 'autorite', 'confiance'],
      explication: 'Le plus vicieux : le faux message s\'affiche dans la même conversation que de vrais SMS des impôts, parce que le nom d\'expéditeur « Impots » peut être copié par n\'importe qui. On fait donc confiance au fil entier. Mais l\'administration ne demande jamais votre RIB par SMS, et ne rembourse jamais via un lien.',
      indice: 'Même dans une conversation qui semble officielle, un message qui réclame votre RIB ou vos coordonnées bancaires est un piège. Le vrai site finit par « .gouv.fr », pas « .gouv.fr-remboursement.net ».'
    },
    {
      id: 'sms-rdv', app: 'sms', difficulte: 2, type: 'legit',
      exp: 'Cabinet Med', avatar: '+', couleur: '#1E7B4F', statut: 'SMS',
      apercu: 'Rappel : RDV avec le Dr Laurent le 02/10 à 15h30. Répondez OUI...',
      fil: [
        { sens: 'recu', texte: 'Rappel : vous avez rendez-vous avec le Dr Laurent le 02/10 à 15h30. Pour confirmer, répondez OUI. Pour annuler, appelez le 04 67 12 34 56.', heure: '08:15' }
      ],
      explication: 'Ça ressemble à un vrai rappel de rendez-vous médical, et ça en est un. Il ne met aucun lien, ne demande ni argent ni mot de passe, et donne un vrai numéro à appeler. Répondre OUI est sans risque. Supprimer ne vous exposerait pas, mais vous pourriez oublier le rendez-vous.',
      indice: 'Aucun lien, aucune demande d\'argent ou de code, un numéro de téléphone normal : rien ici ne cherche à vous faire paniquer. C\'est le signe d\'un message légitime.'
    },

    /* ===================== WHATSAPP ===================== */
    {
      id: 'wa-maman', app: 'whatsapp', difficulte: 2, type: 'piege',
      exp: '+33 7 68 40 19 55', avatar: '?', couleur: '#128C7E', statut: 'en ligne',
      apercu: 'Coucou maman c\'est moi, j\'ai cassé mon téléphone, voici mon nouveau numéro',
      fil: [
        { sens: 'recu', texte: 'Coucou maman c\'est moi 🙂 j\'ai cassé mon téléphone et j\'écris depuis un autre. Enregistre ce nouveau numéro stp', heure: '19:02' },
        { sens: 'recu', texte: 'J\'ai un souci, je n\'arrive plus à accéder à ma banque depuis le nouveau tél. Tu pourrais me dépanner d\'un virement de 480€ ? Je te rembourse demain promis ❤️', heure: '19:04' }
      ],
      leviers: ['confiance', 'urgence', 'curiosite'],
      explication: 'C\'est l\'arnaque « bonjour maman », l\'une des plus répandues sur WhatsApp. L\'escroc se fait passer pour votre enfant avec un nouveau numéro, installe la confiance, puis invente une urgence pour obtenir un virement. Le passage à l\'argent après un changement de numéro est le signal d\'alarme.',
      indice: 'Un proche qui change de numéro ET demande de l\'argent dans la foulée : appelez-le sur son ANCIEN numéro pour vérifier que c\'est bien lui. Ne virez rien avant d\'avoir entendu sa voix.'
    },
    {
      id: 'wa-video', app: 'whatsapp', difficulte: 3, type: 'piege',
      exp: 'Sophie (amie)', avatar: 'S', couleur: '#7B61B0', statut: 'en ligne',
      apercu: '😮 c\'est bien toi sur cette vidéo ?? regarde...',
      fil: [
        { sens: 'recu', texte: '😮 c\'est bien toi sur cette vidéo ?? 😂', heure: '13:20' },
        { sens: 'recu', texte: apercu('▶️', 'Vidéo — cliquez pour voir', 'video-partage-vip.com/v/8821'), heure: '13:20' }
      ],
      leviers: ['curiosite', 'confiance'],
      explication: 'Le message vient d\'une amie… dont le compte a été piraté. L\'escroc envoie à tous ses contacts un lien piégé qui joue sur la curiosité (« c\'est toi sur la vidéo ? »). Le lien mène à une fausse page de connexion qui vole votre compte à votre tour, pour continuer la chaîne.',
      indice: 'Un lien inattendu, même venant d\'un ami, doit alerter, surtout s\'il joue sur la curiosité ou la gêne. Dans le doute, demandez à votre amie de vive voix si elle a vraiment envoyé ça.'
    },
    {
      id: 'wa-job', app: 'whatsapp', difficulte: 2, type: 'piege',
      exp: '+44 7911 123456', avatar: '💼', couleur: '#128C7E', statut: 'en ligne',
      apercu: 'Bonjour ! Recrutement à distance, 80 à 300€/jour, 1h de travail...',
      fil: [
        { sens: 'recu', texte: 'Bonjour ! Je suis Léa, recruteuse. Nous proposons un travail à distance : 80 à 300€/jour, 1h par jour, il suffit de liker des vidéos. Intéressé(e) ? Répondez OUI pour commencer.', heure: '10:45' }
      ],
      leviers: ['argent', 'curiosite'],
      explication: 'La fausse offre d\'emploi trop belle pour être vraie. On vous fait gagner un peu d\'argent au début pour gagner votre confiance, puis on vous demande d\'« investir » pour débloquer vos gains. L\'argent que vous versez est perdu. Un vrai employeur ne recrute pas par WhatsApp pour liker des vidéos.',
      indice: 'Un revenu élevé pour presque aucun travail, un numéro étranger, un premier contact par WhatsApp : ce sont les marques d\'une arnaque. On ne répond pas, on bloque et on signale.'
    },
    {
      id: 'wa-code', app: 'whatsapp', difficulte: 3, type: 'piege',
      exp: 'Julien (cousin)', avatar: 'J', couleur: '#C2622D', statut: 'en ligne',
      apercu: 'Salut ! Je t\'ai envoyé un code à 6 chiffres par erreur, tu peux me le renvoyer ?',
      fil: [
        { sens: 'recu', texte: 'Salut ! J\'ai fait une bêtise, j\'ai demandé un code et il est arrivé sur ton numéro par erreur 😅 tu peux me le renvoyer stp ? C\'est un code à 6 chiffres', heure: '15:30' }
      ],
      leviers: ['confiance', 'urgence'],
      explication: 'Le compte de votre cousin a été piraté, et l\'escroc essaie maintenant de voler le VÔTRE. Le code à 6 chiffres que vous venez de recevoir, c\'est le code de connexion à votre propre compte WhatsApp. Si vous le transmettez, l\'escroc prend le contrôle de votre compte et arnaque vos contacts.',
      indice: 'Jamais, au grand jamais, on ne transmet un code reçu par SMS, même à un proche. Ce code protège VOTRE compte. WhatsApp le rappelle d\'ailleurs dans le message qui contient le code.'
    },

    /* ===================== E-MAILS ===================== */
    {
      id: 'mail-netflix', app: 'email', difficulte: 2, type: 'piege',
      exp: 'Netflix', from: 'no-reply@netflix-paiement-info.com', objet: 'Confirmation de votre paiement',
      avatar: 'N', couleur: '#B20710', heure: '08:24',
      apercu: 'Votre abonnement a été renouvelé pour 59,99€. Si vous n\'êtes pas à l\'origine de ce paiement...',
      corps: 'Bonjour,<br><br>Merci ! Votre abonnement <b>Netflix</b> a bien été renouvelé pour la formule annuelle, d\'un montant de <b>59,99€</b>, débité aujourd\'hui.<br><br>Si vous n\'êtes pas à l\'origine de ce paiement, vous pouvez annuler la transaction et demander un remboursement :<br><br>' + lien('Annuler le prélèvement et être remboursé'),
      leviers: ['argent', 'urgence'],
      explication: 'Le piège parfait : personne n\'a envie de payer 59,99€ pour rien, donc on se précipite pour « annuler ». C\'est exactement ce que veut l\'escroc. Le lien mène à une fausse page qui vous réclame vos identifiants puis votre carte « pour le remboursement ». En réalité, il n\'y a jamais eu de prélèvement.',
      indice: 'Regardez l\'adresse après le @ : « netflix-paiement-info.com » n\'est pas netflix.com. Dans le doute, ne cliquez pas : ouvrez vous-même l\'application Netflix et vérifiez vos paiements.'
    },
    {
      id: 'mail-facture', app: 'email', difficulte: 2, type: 'piege',
      exp: 'EDF', from: 'service-client@edf-regularisation.com', objet: 'Facture impayée — risque de coupure sous 72h',
      avatar: 'E', couleur: '#1B6CB3', heure: 'hier',
      apercu: 'Votre dernière facture n\'a pas pu être prélevée. Sans régularisation sous 72h...',
      corps: 'Madame, Monsieur,<br><br>Votre dernière facture d\'électricité n\'a pas pu être prélevée. <b>Sans régularisation sous 72 heures, votre alimentation pourrait être interrompue.</b><br><br>Le détail de votre facture se trouve dans le document ci-joint. Merci de le consulter et de régulariser votre situation.',
      piece: { nom: 'Facture_impayee_09-2026.pdf', type: 'PDF' },
      leviers: ['peur', 'urgence', 'autorite'],
      explication: 'La peur de la coupure pousse à ouvrir la pièce jointe sans réfléchir. Ce faux PDF est en réalité un piège : un fichier peut contenir un programme malveillant, ou vous emmener vers une fausse page de paiement. EDF ne menace pas d\'une coupure sous 72h par e-mail avec une pièce jointe.',
      indice: 'On n\'ouvre jamais une pièce jointe inattendue, même si le motif fait peur. L\'adresse « edf-regularisation.com » n\'est pas edf.fr. En cas de doute, connectez-vous à votre espace client EDF en tapant vous-même l\'adresse.'
    },
    {
      id: 'mail-photos', app: 'email', difficulte: 3, type: 'piege',
      exp: 'Marie Dupont', from: 'marie.dupont.photos@gmail.com', objet: 'Photos de la fête 🎉',
      avatar: 'M', couleur: '#7B61B0', heure: '14:10',
      apercu: 'Coucou ! Voici les photos de samedi, il y en a de très drôles de toi 😄',
      corps: 'Coucou ! 😊<br><br>Voici enfin les photos de samedi, il y en a de très drôles de toi 😄<br><br>Je te laisse regarder, dis-moi ta préférée !<br><br>Bises',
      piece: { nom: 'Photos_fete.jpg.exe', type: 'EXE' },
      leviers: ['curiosite', 'confiance'],
      explication: 'La curiosité (« des photos de moi ») et le nom d\'une connaissance mettent en confiance. Mais regardez le fichier : il se termine par <b>.exe</b>, ce n\'est pas une image, c\'est un programme. L\'astuce de la double extension (« .jpg.exe ») fait croire à une photo alors que c\'est un logiciel qui s\'installe quand on l\'ouvre.',
      indice: 'Une vraie photo se termine par .jpg ou .png, jamais par .exe, .zip ou .scr. Un fichier inattendu, même d\'un nom connu, doit alerter : la boîte mail de Marie a pu être piratée. Appelez-la pour vérifier.'
    },
    {
      id: 'mail-securite', app: 'email', difficulte: 3, type: 'piege',
      exp: 'Microsoft', from: 'security@microsoft-account-alert.com', objet: 'Activité de connexion inhabituelle',
      avatar: 'M', couleur: '#2672EC', heure: '23:47',
      apercu: 'Nous avons détecté une connexion inhabituelle à votre compte depuis un nouvel appareil...',
      corps: 'Bonjour,<br><br>Nous avons détecté une connexion inhabituelle à votre compte depuis un nouvel appareil :<br><br>📍 Kiev, Ukraine<br>🕐 Aujourd\'hui, 23:41<br><br>Si vous n\'êtes pas à l\'origine de cette connexion, votre mot de passe a peut-être été compromis. Sécurisez votre compte immédiatement :<br><br>' + lien('Sécuriser mon compte maintenant'),
      leviers: ['peur', 'autorite', 'urgence'],
      explication: 'Le lieu lointain et l\'heure précise font très peur et donnent envie de « sécuriser » tout de suite. C\'est le piège : le lien mène à une fausse page de connexion Microsoft qui vole justement votre mot de passe. Un vrai fournisseur ne vous fait jamais vous connecter via un lien d\'alerte.',
      indice: 'L\'adresse « microsoft-account-alert.com » n\'est pas microsoft.com. Pour vérifier une alerte de sécurité, allez vous-même sur le site officiel en tapant son adresse, jamais par le lien du mail.'
    },
    {
      id: 'mail-commande', app: 'email', difficulte: 1, type: 'legit',
      exp: 'Cdiscount', from: 'confirmation@cdiscount.com', objet: 'Votre commande a été expédiée',
      avatar: 'C', couleur: '#1E7B4F', heure: '11:02',
      apercu: 'Bonne nouvelle, votre commande n°80421566 a été expédiée et arrivera jeudi.',
      corps: 'Bonjour,<br><br>Bonne nouvelle : votre commande <b>n°80421566</b> a été expédiée et devrait arriver <b>jeudi</b>.<br><br>Vous pouvez suivre son acheminement à tout moment depuis votre compte, dans la rubrique « Mes commandes ».<br><br>Merci de votre confiance.',
      explication: 'Ça ressemble à une vraie confirmation d\'expédition, et c\'en est une. Elle ne vous demande ni mot de passe, ni paiement, ni action urgente, et vous invite à suivre votre colis depuis votre compte (et non via un lien pressant). Rien ici ne cherche à vous faire paniquer.',
      indice: 'Pas de demande d\'argent ni de code, pas d\'urgence, pas de pièce jointe surprise : les signes d\'un message légitime. Le réflexe sûr reste de suivre la commande en allant vous-même sur votre compte.'
    },
    {
      id: 'mail-newsletter', app: 'email', difficulte: 2, type: 'legit',
      exp: 'Médiathèque', from: 'lettre-info@mediatheque-ville.fr', objet: 'Le programme des animations d\'octobre',
      avatar: 'M', couleur: '#5A6478', heure: 'mar.',
      apercu: 'Lectures, ateliers et rencontres : découvrez le programme du mois à la médiathèque.',
      corps: 'Bonjour,<br><br>Voici le programme des animations d\'octobre à la médiathèque : lectures pour enfants, atelier informatique, et une rencontre avec un auteur le 18 octobre.<br><br>Toutes les animations sont gratuites et sans inscription.<br><br>À bientôt !',
      explication: 'C\'est une vraie lettre d\'information, à laquelle on s\'est abonné. Elle n\'exige rien, ne fait pas peur et ne demande aucune donnée. La supprimer est sans conséquence si le sujet ne vous intéresse pas. Tout n\'est pas un piège : l\'idée est d\'apprendre à faire la différence.',
      indice: 'Aucune urgence, aucune demande d\'argent, de mot de passe ou de pièce jointe : rien à craindre. Inutile de tout supprimer par peur.'
    }
  ];

  function scenario(id) {
    for (var i = 0; i < SCENARIOS.length; i++) if (SCENARIOS[i].id === id) return SCENARIOS[i];
    return null;
  }
  function scenariosDe(app) { return SCENARIOS.filter(function (s) { return s.app === app; }); }

  /* ---------------------------------------------------------
     Mémoire locale
     --------------------------------------------------------- */
  function lire(c) { try { return localStorage.getItem(c); } catch (e) { return null; } }
  function ecrire(c, v) { try { localStorage.setItem(c, v); } catch (e) { /* ignoré */ } }

  var etats = {}; // id -> 'dejoue' | 'piege'
  (lire('messages-vus') || '').split(',').forEach(function (v) {
    if (!v) return; var p = v.split(':'); etats[p[0]] = p[1] === 'p' ? 'piege' : 'dejoue';
  });
  function sauver() {
    ecrire('messages-vus', Object.keys(etats).map(function (id) {
      return etats[id] === 'piege' ? id + ':p' : id + ':d';
    }).join(','));
  }

  /* ---------------------------------------------------------
     Éléments
     --------------------------------------------------------- */
  var telephone = $('#telephone');
  var telEntete = $('#tel-entete');
  var telEcran = $('#tel-ecran');
  var telBarre = $('#tel-barre');
  var zoneCartes = $('#cartes-messages');
  var progression = $('#progression');
  var revelation = $('#revelation');
  var appActive = (['whatsapp', 'email'].indexOf(lire('application')) >= 0) ? lire('application') : 'sms';
  var actif = null;
  var messageArme = false;   // un élément piège est cliquable
  var dernierFocus = null;

  function appliquerCouleurs(racine) {
    $$('[data-bg]', racine).forEach(function (el) { el.style.backgroundColor = el.getAttribute('data-bg'); });
  }

  /* ---------------------------------------------------------
     Cartes (la « boîte de réception »)
     --------------------------------------------------------- */
  function initiale(sc) {
    if (sc.avatar && sc.avatar.length === 1 && /[A-Za-zÀ-ÿ]/.test(sc.avatar)) return sc.avatar;
    if (sc.avatar) return sc.avatar;
    return sc.exp.charAt(0).toUpperCase();
  }
  function points(n) {
    var s = '';
    for (var i = 1; i <= 4; i++) s += '<i class="' + (i <= n ? 'on' : '') + '">•</i>';
    return s;
  }

  function construireCartes() {
    var liste = scenariosDe(appActive);
    zoneCartes.innerHTML = '';
    liste.forEach(function (sc) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'carte-message' + (etats[sc.id] ? ' etat-' + etats[sc.id] : '');
      b.setAttribute('aria-pressed', actif && sc.id === actif.id ? 'true' : 'false');
      b.setAttribute('data-id', sc.id);
      var etat = etats[sc.id] === 'dejoue' ? '✓ Bien géré' : etats[sc.id] === 'piege' ? '✋ Piégé' : '';
      b.innerHTML =
        '<span class="cm-avatar" data-bg="' + sc.couleur + '">' + initiale(sc) + '</span>' +
        '<span class="cm-corps">' +
          '<span class="cm-haut"><span class="cm-exp">' + sc.exp + '</span>' +
            '<span class="cm-diff" aria-label="Difficulté ' + sc.difficulte + ' sur 4">' + points(sc.difficulte) + '</span></span>' +
          '<span class="cm-apercu">' + sc.apercu + '</span>' +
          (etat ? '<span class="cm-etat">' + etat + '</span>' : '') +
        '</span>';
      b.addEventListener('click', function () { choisir(sc.id); telephone.scrollIntoView({ block: 'start' }); });
      zoneCartes.appendChild(b);
    });
    appliquerCouleurs(zoneCartes);

    var vus = liste.filter(function (sc) { return etats[sc.id]; }).length;
    var total = liste.length;
    progression.classList.toggle('complet', vus === total);
    if (vus === total) {
      progression.textContent = 'Vous avez examiné les ' + total + ' messages. Faites le petit test plus bas pour vérifier vos réflexes.';
    } else {
      progression.textContent = vus + ' message' + (vus > 1 ? 's' : '') + ' sur ' + total + ' examiné' + (vus > 1 ? 's' : '');
    }
  }

  /* ---------------------------------------------------------
     Affichage du téléphone
     --------------------------------------------------------- */
  function choisirApp(app) {
    appActive = app;
    ecrire('application', app);
    document.body.setAttribute('data-app', app);
    $$('.choix-app [data-app]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-app') === app ? 'true' : 'false'); });
    var suivant = scenariosDe(app).filter(function (s) { return !etats[s.id]; })[0] || scenariosDe(app)[0];
    choisir(suivant.id);
  }

  function choisir(id) {
    actif = scenario(id);
    construireCartes();
    afficherConversation();
  }

  function afficherConversation() {
    var sc = actif;
    messageArme = false;

    if (appActive === 'email') {
      afficherEmail();
    } else {
      // En-tête messagerie
      telEntete.innerHTML =
        '<span class="tel-retour" aria-hidden="true">‹</span>' +
        '<span class="tel-avatar" data-bg="' + sc.couleur + '">' + initiale(sc) + '</span>' +
        '<span class="tel-titre"><span class="tel-nom">' + sc.exp + '</span><span class="tel-statut">' + (sc.statut || '') + '</span></span>' +
        '<span class="tel-icones" aria-hidden="true">' + (appActive === 'whatsapp' ? '📹 📞' : 'ⓘ') + '</span>';

      // Fil de messages
      var html = '<div class="fil"><p class="date-sep">Aujourd\'hui</p>';
      sc.fil.forEach(function (m) {
        html += '<div class="bulle ' + m.sens + '">' + m.texte +
          '<span class="bulle-heure">' + (m.heure || '') + '</span></div>';
      });
      html += '</div>';
      telEcran.innerHTML = html;
    }

    appliquerCouleurs(telEntete);
    appliquerCouleurs(telEcran);

    // Barre de saisie imitée
    telBarre.innerHTML = '';

    // Les liens/aperçus/pièces jointes piégés déclenchent l'écran STOP
    var pieges = $$('[data-piege]', telEcran);
    if (pieges.length) {
      messageArme = true;
      pieges.forEach(function (el) {
        el.addEventListener('click', function () { reveler('piege'); });
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveler('piege'); }
        });
      });
    }

    afficherChoix();
  }

  function afficherEmail() {
    var sc = actif;
    telEntete.innerHTML =
      '<span class="tel-retour" aria-hidden="true">‹</span>' +
      '<span class="tel-titre"><span class="tel-nom">Boîte de réception</span></span>' +
      '<span class="tel-icones" aria-hidden="true">↩︎  🗑️</span>';

    var html = '<div class="mail">' +
      '<h3 class="mail-objet">' + sc.objet + '</h3>' +
      '<div class="mail-exp">' +
        '<span class="mail-avatar" data-bg="' + sc.couleur + '">' + initiale(sc) + '</span>' +
        '<span class="mail-exp-info">' +
          '<span class="mail-exp-nom">' + sc.exp + ' <span class="mail-heure">' + (sc.heure || '') + '</span></span>' +
          '<span class="mail-exp-adr">&lt;' + sc.from + '&gt;</span>' +
          '<span class="mail-dest">à moi</span>' +
        '</span>' +
      '</div>' +
      '<div class="mail-corps">' + sc.corps + '</div>';
    if (sc.piece) {
      html += '<button type="button" class="piece-jointe" data-piege>' +
        '<span class="pj-icone" aria-hidden="true">' + sc.piece.type + '</span>' +
        '<span class="pj-nom">' + sc.piece.nom + '</span></button>';
    }
    html += '</div>';
    telEcran.innerHTML = html;
  }

  function afficherChoix() {
    var sc = actif;
    var ancien = $('.tel-choix');
    if (ancien) ancien.remove();

    var aPieceJointe = !!$('.piece-jointe', telEcran);
    var aLien = !!$('.lien-msg, .apercu-lien', telEcran);
    var actionPiege;
    if (sc.app === 'email') { actionPiege = aPieceJointe ? 'Ouvrir la pièce jointe' : 'Ouvrir le lien'; }
    else { actionPiege = aLien ? 'Ouvrir le lien' : 'Répondre au message'; }

    var zone = document.createElement('div');
    zone.className = 'tel-choix';
    zone.innerHTML =
      '<p class="tel-choix-titre">Que faites-vous ?</p>' +
      '<div class="choix-action">' +
        '<button type="button" class="ca-piege" data-action="piege"><span class="ca-icone" aria-hidden="true">👆</span>' + actionPiege + '</button>' +
        '<button type="button" class="ca-sup" data-action="supprimer"><span class="ca-icone" aria-hidden="true">🗑️</span>Supprimer et signaler</button>' +
        '<button type="button" class="ca-verif" data-action="verifier"><span class="ca-icone" aria-hidden="true">✅</span>Vérifier par un autre moyen</button>' +
      '</div>';
    telephone.insertAdjacentElement('afterend', zone);

    $$('[data-action]', zone).forEach(function (b) {
      b.addEventListener('click', function () { traiterAction(b.getAttribute('data-action')); });
    });
  }

  /* ---------------------------------------------------------
     Traitement des actions → écran de révélation
     --------------------------------------------------------- */
  function traiterAction(action) {
    var piege = actif.type === 'piege';
    if (action === 'piege') { reveler(piege ? 'piege' : 'info-lien'); }
    else if (action === 'supprimer') { reveler(piege ? 'dejoue' : 'info-suppr'); }
    else { reveler(piege ? 'meilleur' : 'meilleur-legit'); }
  }

  var TEXTES = {
    piege: {
      res: 'piege', panneau: 'STOP', titre: 'Vous êtes tombé dans le piège.',
      rassure: 'Ici, rien ne s\'est passé : aucun lien n\'a été ouvert, aucun message envoyé. Votre appareil ne risque rien.',
      indiceTitre: '🔍 L\'indice qui aurait dû vous alerter', leviers: true
    },
    dejoue: {
      res: 'dejoue', panneau: '✓', titre: 'Bon réflexe !',
      rassure: 'Supprimer et signaler ce message était une bonne réponse : c\'était bien un piège.',
      indiceTitre: '🔍 Ce qui trahissait le piège', leviers: true
    },
    meilleur: {
      res: 'meilleur', panneau: '★', titre: 'Le meilleur réflexe !',
      rassure: 'Vérifier par un autre moyen est LA bonne réponse : c\'est le réflexe qui déjoue presque tous les pièges. Et c\'était bien un piège.',
      indiceTitre: '🔍 Ce qui trahissait le piège', leviers: true
    },
    'info-lien': {
      res: 'info', panneau: 'i', titre: 'C\'était un vrai message.',
      rassure: 'Bonne nouvelle : ce message était légitime, donc cliquer ne portait pas à conséquence ici.',
      indiceTitre: '👍 À garder en tête', leviers: false, forceIndice:
        'Le réflexe le plus sûr reste toutefois de vérifier par vous-même. Et rappelez-vous : on ne communique jamais un code de sécurité, même pour un vrai message.'
    },
    'info-suppr': {
      res: 'info', panneau: 'i', titre: 'C\'était un vrai message.',
      rassure: 'Ce message était légitime. Le supprimer n\'est pas grave, mais vous auriez pu passer à côté d\'une information utile (un rendez-vous, un code demandé).',
      indiceTitre: '👍 À garder en tête', leviers: false, forceIndice:
        'Pas besoin de tout supprimer par peur. Un message sans lien, sans demande d\'argent ni de code, avec un vrai numéro, est généralement légitime.'
    },
    'meilleur-legit': {
      res: 'meilleur', panneau: '★', titre: 'Excellent réflexe.',
      rassure: 'Ce message était en fait légitime — mais vérifier par un autre moyen est toujours une bonne idée et ne coûte rien. C\'est le réflexe parfait.',
      indiceTitre: '👍 À garder en tête', leviers: false, forceIndice:
        'Vérifier par soi-même fonctionne dans tous les cas : si le message est vrai, vous ne perdez rien ; s\'il est faux, vous êtes protégé.'
    }
  };

  function reveler(cle) {
    if (cle === 'piege' && !messageArme && actif.type === 'piege') { /* déclenché par un lien, ok */ }
    var t = TEXTES[cle];
    if (!t) return;
    messageArme = false;

    etats[actif.id] = (t.res === 'piege') ? 'piege' : 'dejoue';
    sauver();

    revelation.setAttribute('data-resultat', t.res);
    $('#rev-panneau-texte').textContent = t.panneau;
    $('#rev-titre').textContent = t.titre;
    $('#rev-rassure').textContent = t.rassure;
    $('#rev-explication').innerHTML = actif.explication;
    $('#rev-indice-titre').textContent = t.indiceTitre;
    $('#rev-indice').innerHTML = t.forceIndice || actif.indice;

    var zoneLev = $('#rev-leviers');
    if (t.leviers && actif.leviers && actif.leviers.length) {
      $('#rev-leviers-liste').innerHTML = actif.leviers.map(function (k) {
        return '<span class="puce-levier">' + (LEVIERS[k] ? LEVIERS[k].icone : '') + ' ' + nomLevier(k) + '</span>';
      }).join('');
      zoneLev.hidden = false;
    } else {
      zoneLev.hidden = true;
    }

    $('#rev-suivant').hidden = !prochainNonVu();
    dernierFocus = document.activeElement;
    revelation.hidden = false;
    document.body.style.overflow = 'hidden';
    revelation.scrollTop = 0;
    $('.rev-boite', revelation).focus({ preventScroll: true });
  }

  function prochainNonVu() {
    var liste = scenariosDe(appActive);
    var i = liste.indexOf(actif);
    for (var j = 1; j <= liste.length; j++) {
      var sc = liste[(i + j) % liste.length];
      if (!etats[sc.id]) return sc;
    }
    return null;
  }

  function fermer(action) {
    revelation.hidden = true;
    document.body.style.overflow = '';
    if (action === 'suivant') {
      var suivant = prochainNonVu();
      choisir(suivant ? suivant.id : actif.id);
      telephone.scrollIntoView({ block: 'start' });
    } else {
      choisir(actif.id);
      telephone.scrollIntoView({ block: 'start' });
    }
  }
  $('#rev-suivant').addEventListener('click', function () { fermer('suivant'); });
  $('#rev-recommencer').addEventListener('click', function () { fermer('recommencer'); });

  revelation.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { fermer('recommencer'); return; }
    if (e.key !== 'Tab') return;
    var f = $$('button', revelation).filter(function (b) { return !b.hidden; });
    var premier = f[0], dernier = f[f.length - 1];
    if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
    else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
  });

  $$('.choix-app [data-app]').forEach(function (b) {
    b.addEventListener('click', function () { choisirApp(b.getAttribute('data-app')); });
  });
  $('#remise-zero').addEventListener('click', function () {
    etats = {}; sauver(); choisir(scenariosDe(appActive)[0].id);
  });

  choisirApp(appActive);

  /* ---------------------------------------------------------
     Section « leviers » (cartes explicatives)
     --------------------------------------------------------- */
  (function leviers() {
    var zone = $('#cartes-leviers');
    Object.keys(LEVIERS).forEach(function (k) {
      var l = LEVIERS[k];
      var d = document.createElement('div');
      d.className = 'carte-levier';
      d.innerHTML =
        '<div class="cl-haut"><span class="cl-icone" aria-hidden="true">' + l.icone + '</span><span class="cl-nom">' + l.nom + '</span></div>' +
        '<p class="cl-exemple">' + l.exemple + '</p>' +
        '<p class="cl-reflexe">' + l.reflexe + '</p>';
      zone.appendChild(d);
    });
  })();

  /* ---------------------------------------------------------
     Mini-jeu : quel levier ?
     --------------------------------------------------------- */
  var QUESTIONS = [
    { exp: 'Netflix', msg: 'Votre abonnement a été renouvelé pour 59,99€. Si vous n\'êtes pas à l\'origine de ce paiement, annulez ici : netflix-facturation.com', bon: 'argent',
      pourquoi: 'On vous fait croire à un prélèvement pour que vous vous précipitiez afin de l\'annuler — et que vous entriez votre carte sur une fausse page.' },
    { exp: '+33 7 55 12 88 03', msg: 'Coucou maman, j\'ai cassé mon téléphone, c\'est mon nouveau numéro. J\'ai besoin que tu me fasses un virement urgent, je t\'expliquerai.', bon: 'confiance',
      pourquoi: 'L\'escroc se fait passer pour un proche pour exploiter votre confiance, avant d\'ajouter l\'urgence.' },
    { exp: 'Banque', msg: 'ALERTE : connexion inhabituelle détectée sur votre compte. Sécurisez-le immédiatement : securite-acces-client.com', bon: 'peur',
      pourquoi: 'On déclenche la peur de se faire pirater pour court-circuiter votre réflexion.' },
    { exp: 'DGFiP', msg: 'Dernier rappel : sans action sous 24h, votre dossier sera transmis au service contentieux.', bon: 'urgence',
      pourquoi: 'Le délai très court est fait pour vous faire agir avant d\'avoir le temps de vérifier.' },
    { exp: 'Sophie', msg: '😮 c\'est bien toi sur cette vidéo ?? regarde 👉 video-partage-vip.com', bon: 'curiosite',
      pourquoi: 'La curiosité (et un peu de gêne) vous pousse à cliquer sur le lien piégé.' },
    { exp: 'Gendarmerie', msg: 'Convocation officielle. Vous êtes mis en cause dans une affaire. Répondez sous 48h pour éviter les poursuites.', bon: 'autorite',
      pourquoi: 'On se réclame d\'une autorité qui impressionne pour que vous n\'osiez pas vérifier.' }
  ];
  var CHOIX = ['peur', 'urgence', 'argent', 'curiosite', 'autorite', 'confiance'];

  var zoneJeu = $('#jeu-zone');
  var jeuRepondu = 0, jeuBon = 0;

  function melange(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function construireJeu() {
    jeuRepondu = 0; jeuBon = 0;
    zoneJeu.innerHTML = '';
    QUESTIONS.forEach(function (q, i) {
      // 4 options : la bonne + 3 autres au hasard
      var autres = melange(CHOIX.filter(function (k) { return k !== q.bon; })).slice(0, 3);
      var options = melange([q.bon].concat(autres));
      var bloc = document.createElement('div');
      bloc.className = 'question';
      bloc.innerHTML =
        '<p class="question-num">Message ' + (i + 1) + ' sur ' + QUESTIONS.length + '</p>' +
        '<div class="msg-jeu"><span class="exp-sms">' + q.exp + '</span>' + q.msg + '</div>' +
        '<div class="reponses" role="group" aria-label="Quel levier ?">' +
          options.map(function (k) { return '<button type="button" data-lev="' + k + '">' + LEVIERS[k].icone + ' ' + LEVIERS[k].nom + '</button>'; }).join('') +
        '</div><div class="zone-retour" aria-live="polite"></div>';

      $$('.reponses button', bloc).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var juste = btn.getAttribute('data-lev') === q.bon;
          $$('.reponses button', bloc).forEach(function (b) { b.disabled = true; });
          btn.classList.add('choisi');
          jeuRepondu++; if (juste) jeuBon++;
          var r = document.createElement('div');
          r.className = 'retour ' + (juste ? 'bon' : 'faux');
          r.innerHTML = '<strong>' + (juste ? 'Exact.' : 'Le principal levier était plutôt « ' + LEVIERS[q.bon].nom +' ».') + '</strong>' + q.pourquoi;
          $('.zone-retour', bloc).appendChild(r);
          if (jeuRepondu === QUESTIONS.length) score();
        });
      });
      zoneJeu.appendChild(bloc);
    });
  }
  function score() {
    var b = document.createElement('div');
    b.className = 'score'; b.setAttribute('tabindex', '-1');
    var msg = jeuBon === QUESTIONS.length ? 'Sans faute ! Vous repérez le levier derrière chaque message : c\'est la meilleure protection.'
      : jeuBon >= QUESTIONS.length - 2 ? 'Très bien. Relisez les leviers que vous avez manqués, l\'idée est de les sentir venir.'
      : 'C\'est justement l\'intérêt de s\'entraîner. Relisez la section « Comment ils vous manipulent », puis recommencez.';
    b.innerHTML = '<h3>Résultat : ' + jeuBon + ' sur ' + QUESTIONS.length + '</h3><p>' + msg + '</p>' +
      '<div class="actions"><button type="button" class="bouton bouton-principal" id="jeu-recommencer">Recommencer le test</button></div>';
    zoneJeu.appendChild(b); b.focus();
    $('#jeu-recommencer').addEventListener('click', function () { construireJeu(); $('#jeu').scrollIntoView(); });
  }
  construireJeu();

  /* ---------------------------------------------------------
     Taille du texte
     --------------------------------------------------------- */
  var TAILLES = [100, 112.5, 125, 137.5, 150, 175];
  var it = 2;
  var memo = parseInt(lire('taille-texte'), 10);
  if (!isNaN(memo) && memo >= 0 && memo < TAILLES.length) it = memo;
  function appliquerTaille() { document.documentElement.style.fontSize = TAILLES[it] + '%'; ecrire('taille-texte', String(it)); }
  if (it !== 2) appliquerTaille();
  $$('[data-taille]').forEach(function (b) {
    b.addEventListener('click', function () {
      it = Math.max(0, Math.min(TAILLES.length - 1, it + (b.getAttribute('data-taille') === 'plus' ? 1 : -1)));
      appliquerTaille();
    });
  });

  /* ---------------------------------------------------------
     Impression et partage (aucune donnée envoyée)
     --------------------------------------------------------- */
  $('#imprimer').addEventListener('click', function () { window.print(); });
  var adresse = location.href.split('#')[0];
  var texte = 'Attention aux faux SMS et messages WhatsApp ! Ce site apprend à repérer les pièges en quelques minutes, sans danger : ';
  $('#partage-whatsapp').href = 'https://wa.me/?text=' + encodeURIComponent(texte + adresse);
  $('#partage-mail').href = 'mailto:?subject=' + encodeURIComponent('Attention aux faux SMS et messages WhatsApp') +
    '&body=' + encodeURIComponent('Bonjour,\n\n' + texte + '\n' + adresse + '\n\nÀ bientôt');
  var natif = $('#partage-natif');
  if (navigator.share) {
    natif.classList.remove('cache');
    natif.addEventListener('click', function () { navigator.share({ title: document.title, text: texte, url: adresse }).catch(function () {}); });
  }
})();
