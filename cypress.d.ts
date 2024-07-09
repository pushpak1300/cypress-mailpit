import type { Message, MessagesSummary, SendEmailOptions, SpamAssassin } from "./src/types";

/// <reference types="cypress" />
declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Get all mails from the mailbox.
			 * @param start
			 * @param limit
			 */
			mailpitGetAllMails(start?: number, limit?: number): Chainable<MessagesSummary>;

			/**
			 * Search all mails from the mailbox using query.
			 * @param query
			 * @param start
			 * @param limit
			 */
			mailpitSearchEmails(query: string, start?: number, limit?: number): Chainable<MessagesSummary>;

			/**
			 * Get all mails from the mailbox using subject.
			 * @param subject
			 * @param start
			 * @param limit
			 */
			mailpitGetEmailsBySubject(subject: string, start?: number, limit?: number): Chainable<MessagesSummary>;

			/**
			 * Check is mails has email using subject.
			 * @param subject
			 * @param start
			 * @param limit
			 */
			mailpitHasEmailsBySubject(subject: string, start?: number, limit?: number): Chainable;

			/**
			 * Check is mails has not any emails using subject.
			 * @param subject
			 * @param start
			 * @param limit
			 */
			mailpitNotHasEmailsBySubject(subject: string, start?: number, limit?: number): Chainable;

			/**
			 * Get all mails from the mailbox using To.
			 * @param email
			 * @param start
			 * @param limit
			 */
			mailpitGetEmailsByTo(email: string, start?: number, limit?: number): Chainable<MessagesSummary>;

			/**
			 * Check is mails has email using To.
			 * @param email
			 * @param start
			 * @param limit
			 */
			mailpitHasEmailsByTo(email: string, start?: number, limit?: number): Chainable;

			/**
			 * Check is mails not has email using To.
			 * @param email
			 * @param start
			 * @param limit
			 */
			mailpitNotHasEmailsByTo(email: string, start?: number, limit?: number): Chainable;

			/**
			 * Get the mail text body.
			 * @param message
			 */
			mailpitGetMailTextBody(message?: Message): Chainable<string>;

			/**
			 * Get the mail html body.
			 * @param message
			 */
			mailpitGetMailHTMlBody(message?: Message): Chainable<string>;

			/**
			 * Get the mail from address.
			 * @param message
			 */
			mailpitGetFromAddress(message?: Message): Chainable<string>;

			/**
			 * Get the attachments of the mail.
			 * @param message
			 */
			mailpitGetAttachments(message?: Message): Chainable<string>;

			/**
			 * Get the mail spam assassin summary.
			 * @param message
			 */
			mailpitGetMailSpamAssassinSummary(message?: Message): Chainable<SpamAssassin>;

			/**
			 * Get the mail spam assassin summary. this is a deprecated method. Only for backward compatibility.
			 * @param message
			 * @deprecated Use mailpitGetMailSpamAssainSummary instead.
			 */
			mailpitGetMailSpamAssainSummary(message?: Message): Chainable<SpamAssassin>;

			/**
			 * Get the mail recipient address.
			 * @param message
			 */
			mailpitGetRecipientAddress(message?: Message): Chainable<Array<string>>;

			/**
			 * Get the mail subject.
			 * @param message
			 */
			mailpitGetSubject(message?: Message): Chainable<string>;

			/**
			 * Get the mail by id.
			 * if id is not provided, it will get the latest email.
			 *
			 * @param id
			 */
			mailpitGetMail(id?: string): Chainable<Message>;

			/**
			 * Send Mail
			 * If params are not provided, it will send a default email.
			 *
			 * @param options SendEmailOptions
			 */
			mailpitSendMail(options?: SendEmailOptions): Chainable<{ ID: string }>;

			/**
			 * Delete all emails from the mailbox.
			 */
			mailpitDeleteAllEmails(): Chainable<void>;
		}
	}
}
