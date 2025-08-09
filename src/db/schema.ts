import {
  pgTable,
  serial,
  text,
  integer,
  real,
  timestamp,
  boolean,
  json,
  varchar,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---------------------------------------------------------------- //
// MODÈLES DE DONNÉES DE L'APPLICATION
// ---------------------------------------------------------------- //

// Modèle pour les livres disponibles à la personnalisation (catalogue)
export const books = pgTable('Book', {
  id: serial('id').primaryKey(),
  title: text('title').notNull().unique(),
  description: text('description').notNull(),
  shortDescription: text('shortDescription').notNull(),
  description_fr: text('description_fr'),
  description_en: text('description_en'),
  description_de: text('description_de'),
  description_es: text('description_es'),
  description_ar: text('description_ar'),
  shortDescription_fr: text('shortDescription_fr'),
  shortDescription_en: text('shortDescription_en'),
  shortDescription_de: text('shortDescription_de'),
  shortDescription_es: text('shortDescription_es'),
  shortDescription_ar: text('shortDescription_ar'),
  coverImage: text('coverImage').notNull(),
  price: real('price').notNull(),
  tags: text('tags').array().notNull().default([]),
  pdfUrl: text('pdfUrl'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Modèle pour les valeurs éducatives
export const values = pgTable('Value', {
  id: serial('id').primaryKey(),
  name_fr: text('name_fr'),
  name_en: text('name_en'),
  name_de: text('name_de'),
  name_es: text('name_es'),
  name_ar: text('name_ar'),
});

// Modèle pour les utilisateurs
export const users = pgTable('User', {
  id: text('id').primaryKey(),
  name: text('name'),
  firstName: text('firstName'),
  lastName: text('lastName'),
  email: text('email').unique(),
  phoneNumber: text('phoneNumber').unique(),
  emailVerified: timestamp('emailVerified'),
  image: text('image'),
  password: text('password'),
  birthDate: timestamp('birthDate'),
  address: text('address'),
  city: text('city'),
  country: text('country'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Modèle pour les comptes (NextAuth)
export const accounts = pgTable('Account', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  providerProviderAccountId: unique().on(account.provider, account.providerAccountId),
}));

// Modèle pour les sessions (NextAuth)
export const sessions = pgTable('Session', {
  id: text('id').primaryKey(),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

// Modèle pour les tokens de vérification (NextAuth)
export const verificationTokens = pgTable('VerificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires').notNull(),
}, (vt) => ({
  identifierToken: unique().on(vt.identifier, vt.token),
}));

// Modèle pour les commandes personnalisées
export const personalizedOrders = pgTable('PersonalizedOrder', {
  id: serial('id').primaryKey(),
  childName: text('childName').notNull(),
  childPhotoUrl: text('childPhotoUrl'),
  generatedContent: text('generatedContent'),
  userFullName: text('userFullName'),
  userPhoneNumber: text('userPhoneNumber'),
  heroAgeRange: text('heroAgeRange'),
  mainTheme: text('mainTheme'),
  storyLocation: text('storyLocation'),
  residentialArea: text('residentialArea'),
  packType: text('packType'),
  bookLanguages: text('bookLanguages').array().notNull().default([]),
  messageSpecial: text('messageSpecial'),
  deliveryAddress: text('deliveryAddress'),
  city: text('city'),
  postalCode: text('postalCode'),
  country: text('country'),
  status: text('status').notNull().default('IN_CART'),
  readProgress: integer('readProgress').notNull().default(0),
  calculatedPrice: real('calculatedPrice').notNull().default(0),
  originalBookPrice: real('originalBookPrice').notNull().default(0),
  uploadedImages: text('uploadedImages').array().notNull().default([]),
  personalizationData: json('personalizationData'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  bookId: integer('bookId').references(() => books.id),
  paymentMethod: text('paymentMethod'),
  paymentDetails: text('paymentDetails'),
  paidAt: timestamp('paidAt'),
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }),
  guestToken: text('guestToken'),
  type: text('type').notNull().default('STANDARD'),
});

// Modèle pour les personnages secondaires
export const characters = pgTable('Character', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  relationshipToHero: text('relationshipToHero').notNull(),
  animalType: text('animalType'),
  sex: text('sex'),
  age: text('age'),
  photoUrl: text('photoUrl'),
  personalizedOrderId: integer('personalizedOrderId').notNull().references(() => personalizedOrders.id, { onDelete: 'cascade' }),
});

// Modèle pour les commandes non personnalisées (panier)
export const cartOrders = pgTable('CartOrder', {
  id: serial('id').primaryKey(),
  bookId: integer('bookId').notNull().references(() => books.id),
  quantity: integer('quantity').notNull().default(1),
  userId: text('userId').references(() => users.id, { onDelete: 'cascade' }),
  guestToken: text('guestToken'),
  status: text('status').notNull().default('IN_CART'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  paymentMethod: text('paymentMethod'),
  paymentDetails: text('paymentDetails'),
  paidAt: timestamp('paidAt'),
});

// Modèle pour les messages de contact
export const contactMessages = pgTable('ContactMessage', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phoneNumber: text('phoneNumber'),
  message: text('message').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// Table de liaison pour les valeurs sélectionnées dans les commandes personnalisées
export const personalizedOrderValues = pgTable('_PersonalizedOrderToValue', {
  A: integer('A').notNull().references(() => personalizedOrders.id, { onDelete: 'cascade' }),
  B: integer('B').notNull().references(() => values.id, { onDelete: 'cascade' }),
}, (table) => ({
  AB: unique().on(table.A, table.B),
}));

// ---------------------------------------------------------------- //
// RELATIONS
// ---------------------------------------------------------------- //

export const booksRelations = relations(books, ({ many }) => ({
  personalizedOrders: many(personalizedOrders),
  cartOrders: many(cartOrders),
}));

export const valuesRelations = relations(values, ({ many }) => ({
  personalizedOrders: many(personalizedOrderValues),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  personalizedOrders: many(personalizedOrders),
  cartOrders: many(cartOrders),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const personalizedOrdersRelations = relations(personalizedOrders, ({ one, many }) => ({
  book: one(books, {
    fields: [personalizedOrders.bookId],
    references: [books.id],
  }),
  user: one(users, {
    fields: [personalizedOrders.userId],
    references: [users.id],
  }),
  characters: many(characters),
  selectedValues: many(personalizedOrderValues),
}));

export const charactersRelations = relations(characters, ({ one }) => ({
  personalizedOrder: one(personalizedOrders, {
    fields: [characters.personalizedOrderId],
    references: [personalizedOrders.id],
  }),
}));

export const cartOrdersRelations = relations(cartOrders, ({ one }) => ({
  book: one(books, {
    fields: [cartOrders.bookId],
    references: [books.id],
  }),
  user: one(users, {
    fields: [cartOrders.userId],
    references: [users.id],
  }),
}));

export const personalizedOrderValuesRelations = relations(personalizedOrderValues, ({ one }) => ({
  personalizedOrder: one(personalizedOrders, {
    fields: [personalizedOrderValues.A],
    references: [personalizedOrders.id],
  }),
  value: one(values, {
    fields: [personalizedOrderValues.B],
    references: [values.id],
  }),
}));

// Types TypeScript générés
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;

export type Value = typeof values.$inferSelect;
export type NewValue = typeof values.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;

export type PersonalizedOrder = typeof personalizedOrders.$inferSelect;
export type NewPersonalizedOrder = typeof personalizedOrders.$inferInsert;

export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;

export type CartOrder = typeof cartOrders.$inferSelect;
export type NewCartOrder = typeof cartOrders.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;