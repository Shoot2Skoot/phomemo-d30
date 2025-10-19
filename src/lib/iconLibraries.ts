export interface IconDefinition {
  name: string;
  svg: string;
  category?: string;
  library: 'built-in' | 'phomemo' | 'lucide';
  tags?: string[];
}

export interface IconLibrary {
  name: string;
  id: string;
  icons: IconDefinition[];
}

// Built-in Material Design style icons
const builtInIcons: IconDefinition[] = [
  {
    name: 'home',
    library: 'built-in',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
    tags: ['house', 'building']
  },
  {
    name: 'star',
    library: 'built-in',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
    tags: ['favorite', 'rating']
  },
  {
    name: 'heart',
    library: 'built-in',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    tags: ['love', 'like', 'favorite']
  },
  {
    name: 'check',
    library: 'built-in',
    category: 'status',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    tags: ['checkmark', 'done', 'complete']
  },
  {
    name: 'warning',
    library: 'built-in',
    category: 'status',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
    tags: ['alert', 'caution', 'danger']
  },
  {
    name: 'info',
    library: 'built-in',
    category: 'status',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
    tags: ['information', 'help']
  },
  {
    name: 'settings',
    library: 'built-in',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>',
    tags: ['gear', 'preferences', 'config']
  },
  {
    name: 'folder',
    library: 'built-in',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/></svg>',
    tags: ['directory', 'files']
  },
  {
    name: 'mail',
    library: 'built-in',
    category: 'communication',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    tags: ['email', 'message', 'envelope']
  },
  {
    name: 'phone',
    library: 'built-in',
    category: 'communication',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
    tags: ['call', 'telephone', 'mobile']
  },
  {
    name: 'location',
    library: 'built-in',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
    tags: ['map', 'pin', 'marker', 'place']
  },
  {
    name: 'gift',
    library: 'built-in',
    category: 'general',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>',
    tags: ['present', 'box']
  }
];

// Phomemo official icon library (placeholder - will be populated)
const phomemoIcons: IconDefinition[] = [
  // TODO: Add Phomemo official icons
  // These would come from Phomemo's official icon set
];

// Lucide icons (popular open-source icon library)
const lucideIcons: IconDefinition[] = [
  // TODO: Add Lucide icons
  // https://lucide.dev/ - clean, consistent icons
];

export const iconLibraries: IconLibrary[] = [
  {
    name: 'Built-in Icons',
    id: 'built-in',
    icons: builtInIcons
  },
  {
    name: 'Phomemo Official',
    id: 'phomemo',
    icons: phomemoIcons
  },
  {
    name: 'Lucide Icons',
    id: 'lucide',
    icons: lucideIcons
  }
];

export const getAllIcons = (): IconDefinition[] => {
  return iconLibraries.flatMap(lib => lib.icons);
};

export const getIconsByLibrary = (libraryId: string): IconDefinition[] => {
  const library = iconLibraries.find(lib => lib.id === libraryId);
  return library ? library.icons : [];
};

export const searchIcons = (query: string): IconDefinition[] => {
  const lowerQuery = query.toLowerCase();
  return getAllIcons().filter(icon =>
    icon.name.toLowerCase().includes(lowerQuery) ||
    icon.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    icon.category?.toLowerCase().includes(lowerQuery)
  );
};
