import polyglotI18nProvider from 'ra-i18n-polyglot';
import type { TranslationMessages } from 'react-admin';
import englishMessages from 'ra-language-english';
import frenchMessages from 'ra-language-french';
import { mergePluginI18n } from '@psychedcms/admin-core';

const customEnMessages = {
  psyched: {
    menu: {
      content: 'Content',
      admin: 'Admin',
      settings: 'Settings',
    },
    sidebar: {
      language: 'Language',
      primary_actions: 'Primary Actions',
      current_status: 'Current status:',
      options: 'Options',
    },
    settings: {
      global: 'Global',
      preferences: 'Preferences',
      global_settings_title: 'Global Settings',
      language_section: 'Language',
      default_language: 'Default Language',
      save: 'Save',
      saving: 'Saving...',
      preferences_title: 'Preferences',
      ui_language: 'Language',
      ui_language_description: 'Choose your preferred language for the admin interface. Content editing language is managed separately in each edit form.',
      save_preferences: 'Save Preferences',
    },
    fields: {
      status: 'Status',
      published_at: 'Published at',
      depublished_at: 'Depublished at',
      author: 'Author',
      search_address: 'Search address',
    },
    metadata: {
      created: 'Created:',
      modified: 'Modified:',
      id: 'ID:',
    },
    status: {
      draft: 'Draft',
      review: 'In Review',
      scheduled: 'Scheduled',
      published: 'Published',
      archived: 'Archived',
    },
    workflow: {
      publish: 'Publish',
      approve: 'Approve',
      submit_for_review: 'Submit for Review',
      schedule: 'Schedule',
      unschedule: 'Unschedule',
      request_changes: 'Request Changes',
      unpublish: 'Unpublish',
      archive: 'Archive',
      restore: 'Restore',
      auto_publish: 'Auto Publish',
    },
    schedule_dialog: {
      title: 'Schedule Publication',
      error_future: 'Scheduled date must be in the future',
      cancel: 'Cancel',
      scheduling: 'Scheduling...',
      confirm: 'Schedule',
    },
  },
  resources: {
    pages: { name: 'Pages' },
    posts: { name: 'Posts' },
    genres: { name: 'Genres' },
    taxonomies: { name: 'Taxonomies' },
    users: { name: 'Users' },
    media: { name: 'Media' },
  },
};

const customFrMessages = {
  psyched: {
    menu: {
      content: 'Contenu',
      admin: 'Administration',
      settings: 'Paramètres',
    },
    sidebar: {
      language: 'Langue',
      primary_actions: 'Actions principales',
      current_status: 'Statut actuel :',
      options: 'Options',
    },
    settings: {
      global: 'Général',
      preferences: 'Préférences',
      global_settings_title: 'Paramètres généraux',
      language_section: 'Langue',
      default_language: 'Langue par défaut',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      preferences_title: 'Préférences',
      ui_language: 'Langue',
      ui_language_description: "Choisissez votre langue préférée pour l'interface d'administration. La langue d'édition du contenu est gérée séparément dans chaque formulaire.",
      save_preferences: 'Enregistrer les préférences',
    },
    fields: {
      status: 'Statut',
      published_at: 'Publié le',
      depublished_at: 'Dépublié le',
      author: 'Auteur',
      search_address: 'Rechercher une adresse',
    },
    metadata: {
      created: 'Créé :',
      modified: 'Modifié :',
      id: 'ID :',
    },
    status: {
      draft: 'Brouillon',
      review: 'En révision',
      scheduled: 'Planifié',
      published: 'Publié',
      archived: 'Archivé',
    },
    workflow: {
      publish: 'Publier',
      approve: 'Approuver',
      submit_for_review: 'Soumettre pour révision',
      schedule: 'Planifier',
      unschedule: 'Déplanifier',
      request_changes: 'Demander des modifications',
      unpublish: 'Dépublier',
      archive: 'Archiver',
      restore: 'Restaurer',
      auto_publish: 'Publication auto',
    },
    schedule_dialog: {
      title: 'Planifier la publication',
      error_future: 'La date planifiée doit être dans le futur',
      cancel: 'Annuler',
      scheduling: 'Planification...',
      confirm: 'Planifier',
    },
  },
  resources: {
    pages: { name: 'Pages' },
    posts: { name: 'Articles' },
    genres: { name: 'Genres' },
    taxonomies: { name: 'Taxonomies' },
    users: { name: 'Utilisateurs' },
    media: { name: 'Médias' },
  },
};

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
      result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

const baseMessages: Record<string, object> = {
  en: deepMerge(englishMessages as unknown as Record<string, unknown>, customEnMessages as unknown as Record<string, unknown>),
  fr: deepMerge(frenchMessages as unknown as Record<string, unknown>, customFrMessages as unknown as Record<string, unknown>),
};

// Merge plugin-contributed i18n messages into the base messages
const messages = mergePluginI18n(baseMessages);

/**
 * Create a polyglot i18n provider for react-admin.
 * The initial locale comes from the user's preferred editing locale.
 */
export function createI18nProvider(defaultLocale: string) {
  return polyglotI18nProvider(
    (locale) => (messages[locale] ?? englishMessages) as TranslationMessages,
    defaultLocale,
  );
}
