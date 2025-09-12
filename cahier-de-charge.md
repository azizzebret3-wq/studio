
# Cahier des Charges - Plateforme "Gagne Ton Concours"

## 1. Objectif Général

Créer une plateforme web moderne, performante et robuste pour aider les candidats au Burkina Faso à préparer les concours de la fonction publique (directs et professionnels). La plateforme doit offrir une expérience utilisateur immersive, gamifiée et s'appuyer sur l'intelligence artificielle pour personnaliser l'apprentissage.

---

## 2. Identité Visuelle et Apparence (Branding)

### 2.1. Logo
- Le logo est composé d'un carré aux coins arrondis contenant les initiales "GTC" en blanc, police grasse et compacte.
- Le fond du carré est un dégradé allant du violet au mauve.
- À côté du carré, le nom complet "Gagne ton concours" est affiché sur les écrans larges, avec un texte en dégradé.

### 2.2. Palette de Couleurs (Thème)
L'application utilise un système de variables CSS pour les thèmes clair et sombre.

- **Primaire**: Violet/Mauve, utilisé pour les actions principales, les boutons et les éléments actifs. (HSL: `262 80% 58%`)
- **Accent**: Rose/Fuchsia, utilisé pour les touches de couleur secondaires et les notifications. (HSL: `330 80% 60%`)
- **Arrière-plan (Background)**:
    - Thème Clair: Un blanc cassé très clair. (HSL: `240 60% 98%`)
    - Thème Sombre: Un bleu très sombre, presque noir. (HSL: `240 10% 3.9%`)
- **Cartes et Modales (Glassmorphism)**:
    - Thème Clair: `background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px);`
    - Thème Sombre: `background: rgba(10, 10, 20, 0.7); backdrop-filter: blur(20px);`
- **Dégradés Thématiques**: Chaque section principale a un dégradé de couleur associé pour ses icônes et titres :
    - Quiz: Bleu à Cyan
    - Concours Blancs: Indigo à Bleu
    - Ressources: Orange à Rouge
    - Formations: Rose à Pink
    - Utilisateurs (Admin): Ambre à Orange
    - Contenu (Admin): Rose à Pink
    - Premium: Jaune à Orange

### 2.3. Typographie
- **Police principale**: `PT Sans` pour les textes courants et les titres. Elle doit être chargée depuis Google Fonts.

---

## 3. Architecture Technique

- **Framework Frontend**: Next.js 15+ avec App Router.
- **Styling**: Tailwind CSS avec les composants de `shadcn/ui`.
- **Base de Données**: Firestore (Firebase).
- **Authentification**: Firebase Authentication (par numéro de téléphone + mot de passe).
- **Fonctionnalités IA**: Google Genkit avec les modèles Gemini.

---

## 4. Structure de la Base de Données (Firestore)

- **Collection `users`**:
    - `uid` (ID du document): ID de l'utilisateur Firebase.
    - `fullName`: string
    - `email`: string (email factice basé sur le téléphone, ex: `70112233@gagnetonconcours.app`)
    - `phone`: string
    - `competitionType`: string (`direct` ou `professionnel`)
    - `role`: string (`user` ou `admin`)
    - `subscription_type`: string (`gratuit` ou `premium`)
    - `createdAt`: Timestamp
- **Collection `quizzes`**:
    - `title`: string
    - `description`: string
    - `category`: string
    - `difficulty`: string (`facile`, `moyen`, `difficile`)
    - `access_type`: string (`gratuit`, `premium`)
    - `duration_minutes`: number
    - `isMockExam`: boolean (pour distinguer les concours blancs)
    - `scheduledFor`: Timestamp (optionnel, pour les concours blancs)
    - `questions`: array of objects
        - `question`: string
        - `options`: array of strings
        - `correctAnswers`: array of strings
        - `explanation`: string (optionnel)
    - `total_questions`: number
    - `createdAt`: Timestamp
- **Collection `documents`**:
    - `title`: string
    - `type`: string (`pdf` ou `video`)
    - `category`: string
    - `access_type`: string (`gratuit`, `premium`)
    - `url`: string (URL du fichier)
    - `createdAt`: Timestamp
- **Collection `attempts`**:
    - `userId`: string (référence à l'UID de l'utilisateur)
    - `quizId`: string (référence à l'ID du quiz)
    - `quizTitle`: string
    - `score`: number
    - `totalQuestions`: number
    - `percentage`: number
    - `createdAt`: Timestamp

---

## 5. Fonctionnalités Utilisateur

### 5.1. Authentification
- **Inscription**: Se fait avec Nom, Prénom(s), Téléphone, Type de concours, et Mot de passe. Le premier utilisateur inscrit doit automatiquement obtenir le rôle `admin`. Les suivants sont `user`.
- **Connexion**: Se fait avec Téléphone et Mot de passe.
- **Gestion de profil**: L'utilisateur peut voir et modifier son nom, son téléphone et sa photo de profil.

### 5.2. Tableau de Bord Principal (`/dashboard`)
- Accueil personnalisé ("Salut [Prénom] !").
- Affichage de statistiques : Quiz totaux, Quiz complétés, Score moyen, Série.
- Section "Quiz Recommandés".
- Section "Derniers Résultats" affichant les derniers quiz tentés.
- Section "Nouveau Contenu" affichant les derniers documents ajoutés.
- CTA pour passer Premium si l'utilisateur est en mode `gratuit`.

### 5.3. Section Quiz (`/dashboard/quizzes`)
- Liste filtrable et consultable de tous les quiz qui ne sont pas des concours blancs.
- Filtres : recherche par texte, catégorie, difficulté, type d'accès.
- Chaque carte de quiz affiche son titre, sa catégorie, sa difficulté, le nombre de questions, la durée et son statut d'accès (Premium ou Gratuit).
- L'accès aux quiz Premium est verrouillé pour les utilisateurs gratuits, avec une redirection vers la page Premium.

### 5.4. Section Concours Blancs (`/dashboard/mock-exams`)
- Liste les quiz marqués comme `isMockExam`.
- Affiche un compte à rebours jusqu'à la date de début (`scheduledFor`).
- Le bouton de participation est désactivé avant la date de début.
- Gère l'accès Premium de la même manière que les quiz.

### 5.5. Section Ressources (`/dashboard/documents`)
- Bibliothèque de documents (PDF et vidéos).
- Filtres par recherche, catégorie et type.
- Gère l'accès Premium.
- **Fonctionnalité IA**: Un bouton "Résumer" (disponible pour les membres Premium) sur les PDF, qui appelle un flow Genkit pour générer et afficher un résumé du contenu du document.

### 5.6. Passage de Quiz (`/dashboard/take-quiz`)
- Interface de quiz question par question.
- Affichage du temps restant (chronomètre).
- Barre de progression.
- Logique pour gérer les questions à choix multiples.
- À la fin, affichage du score, puis de la correction détaillée avec explications.
- Enregistrement de la tentative dans la collection `attempts`.

### 5.7. Page Premium (`/dashboard/premium`)
- Présente les avantages de l'abonnement Premium.
- Un bouton permet de simuler la mise à niveau, qui met à jour le champ `subscription_type` de l'utilisateur à `premium`.

---

## 6. Fonctionnalités Administrateur (`/dashboard/admin/*`)

L'accès à ces routes est protégé et réservé aux utilisateurs avec `role: 'admin'`.

### 6.1. Gérer les Utilisateurs
- Tableau listant tous les utilisateurs avec leur nom, téléphone, rôle et date d'inscription.
- Possibilité de changer le rôle d'un utilisateur de `user` à `admin` (et vice-versa) via une modale.

### 6.2. Gérer la Bibliothèque
- Tableau listant tous les documents de la bibliothèque.
- Formulaire (dans une modale) pour ajouter ou modifier un document (titre, URL, type, catégorie, accès).
- Possibilité de supprimer des documents avec une boîte de dialogue de confirmation.

### 6.3. Gérer les Quiz
- Tableau listant tous les quiz existants.
- Bouton pour créer un nouveau quiz ou modifier un quiz existant, ouvrant une modale plein écran.
- **Formulaire de création/modification de quiz**:
    - Champs pour les métadonnées (titre, description, catégorie, difficulté, etc.).
    - Section pour ajouter, modifier et supprimer dynamiquement des questions.
    - Pour chaque question, possibilité d'ajouter, modifier et supprimer des options.
    - Sélection des bonnes réponses via des cases à cocher.
    - Champ pour l'explication.
- **Fonctionnalité IA**: Un bouton "Générer avec l'IA" qui demande un sujet, appelle un flow Genkit, et pré-remplit le formulaire de quiz avec les données générées par l'IA.

---

## 7. Fonctionnalités d'Intelligence Artificielle (Genkit)

### 7.1. `summarize-training-content`
- **Input**: `{ documentUrl: string }`
- **Output**: `{ summary: string }`
- **Prompt**: Demande à l'IA de se comporter comme un expert en synthèse et de résumer le contenu présumé d'un document à partir de son URL (sans y accéder réellement). Le résumé doit être en français.

### 7.2. `generate-dynamic-quizzes`
- **Input**: `{ topic: string }`
- **Output**: Un objet `quiz` complet, avec titre, description, catégorie, difficulté, durée, et une liste de 10-15 questions. Chaque question a son texte, au moins 4 options, la ou les bonnes réponses, et une explication.
- **Prompt**: Demande à l'IA de se comporter comme un expert en création de quiz pour les concours de la fonction publique du Burkina Faso et de générer un quiz complet en français sur le sujet donné.
