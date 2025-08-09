CREATE TABLE "Account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "Account_provider_providerAccountId_unique" UNIQUE("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "Book" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"shortDescription" text NOT NULL,
	"description_fr" text,
	"description_en" text,
	"description_de" text,
	"description_es" text,
	"description_ar" text,
	"shortDescription_fr" text,
	"shortDescription_en" text,
	"shortDescription_de" text,
	"shortDescription_es" text,
	"shortDescription_ar" text,
	"coverImage" text NOT NULL,
	"price" real NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"pdfUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Book_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "CartOrder" (
	"id" serial PRIMARY KEY NOT NULL,
	"bookId" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"userId" text,
	"guestToken" text,
	"status" text DEFAULT 'IN_CART' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"paymentMethod" text,
	"paymentDetails" text,
	"paidAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "Character" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"relationshipToHero" text NOT NULL,
	"animalType" text,
	"sex" text,
	"age" text,
	"photoUrl" text,
	"personalizedOrderId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ContactMessage" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phoneNumber" text,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_PersonalizedOrderToValue" (
	"A" integer NOT NULL,
	"B" integer NOT NULL,
	CONSTRAINT "_PersonalizedOrderToValue_A_B_unique" UNIQUE("A","B")
);
--> statement-breakpoint
CREATE TABLE "PersonalizedOrder" (
	"id" serial PRIMARY KEY NOT NULL,
	"childName" text NOT NULL,
	"childPhotoUrl" text,
	"generatedContent" text,
	"userFullName" text,
	"userPhoneNumber" text,
	"heroAgeRange" text,
	"mainTheme" text,
	"storyLocation" text,
	"residentialArea" text,
	"packType" text,
	"bookLanguages" text[] DEFAULT '{}' NOT NULL,
	"messageSpecial" text,
	"deliveryAddress" text,
	"city" text,
	"postalCode" text,
	"country" text,
	"status" text DEFAULT 'IN_CART' NOT NULL,
	"readProgress" integer DEFAULT 0 NOT NULL,
	"calculatedPrice" real DEFAULT 0 NOT NULL,
	"originalBookPrice" real DEFAULT 0 NOT NULL,
	"uploadedImages" text[] DEFAULT '{}' NOT NULL,
	"personalizationData" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"bookId" integer,
	"paymentMethod" text,
	"paymentDetails" text,
	"paidAt" timestamp,
	"userId" text,
	"guestToken" text,
	"type" text DEFAULT 'STANDARD' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "Session_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"firstName" text,
	"lastName" text,
	"email" text,
	"phoneNumber" text,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"birthDate" timestamp,
	"address" text,
	"city" text,
	"country" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email"),
	CONSTRAINT "User_phoneNumber_unique" UNIQUE("phoneNumber")
);
--> statement-breakpoint
CREATE TABLE "Value" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_fr" text,
	"name_en" text,
	"name_de" text,
	"name_es" text,
	"name_ar" text
);
--> statement-breakpoint
CREATE TABLE "VerificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "VerificationToken_token_unique" UNIQUE("token"),
	CONSTRAINT "VerificationToken_identifier_token_unique" UNIQUE("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CartOrder" ADD CONSTRAINT "CartOrder_bookId_Book_id_fk" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CartOrder" ADD CONSTRAINT "CartOrder_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Character" ADD CONSTRAINT "Character_personalizedOrderId_PersonalizedOrder_id_fk" FOREIGN KEY ("personalizedOrderId") REFERENCES "public"."PersonalizedOrder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_PersonalizedOrderToValue" ADD CONSTRAINT "_PersonalizedOrderToValue_A_PersonalizedOrder_id_fk" FOREIGN KEY ("A") REFERENCES "public"."PersonalizedOrder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_PersonalizedOrderToValue" ADD CONSTRAINT "_PersonalizedOrderToValue_B_Value_id_fk" FOREIGN KEY ("B") REFERENCES "public"."Value"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PersonalizedOrder" ADD CONSTRAINT "PersonalizedOrder_bookId_Book_id_fk" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PersonalizedOrder" ADD CONSTRAINT "PersonalizedOrder_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;