import type { Message, MessageSummary, MessagesSummary, SendEmailOptions, SpamAssassin } from "./src/types";

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
			 * Check if mailpit has any email with the search query
			 * Automatically retries until the condition is met or timeout is reached.
			 * @param query
			 * @param start
			 * @param limit
			 * @param options Optional. Object with `timeout` and `interval` properties.
			 */
			mailpitHasEmailsBySearch(
				query: string,
				start?: number,
				limit?: number,
				options?: { timeout?: number; interval?: number },
			): Chainable;

			/**
			 * Check if mailpit has any email with the search query
			 * Automatically retries until the condition is met or timeout is reached.
			 * @param query
			 * @param start
			 * @param limit
			 * @param options Optional. Object with `timeout` and `interval` properties.
			 */
			mailpitNotHasEmailsBySearch(
				query: string,
				start?: number,
				limit?: number,
				options?: { timeout?: number; interval?: number },
			): Chainable;

			/**
			 * Check if mails have emails using the subject.
			 * Automatically retries until the condition is met or timeout is reached.
			 * @param subject
			 * @param start
			 * @param limit
			 * @param options Optional. Object with `timeout` and `interval` properties.
			 */
			mailpitHasEmailsBySubject(
				subject: string,
				start?: number,
				limit?: number,
				options?: { timeout?: number; interval?: number },
			): Chainable;

			/**
			 * Check if mails do not have emails using the subject.
			 * Automatically retries until the condition is met or timeout is reached.
			 * @param subject
			 * @param start
			 * @param limit
			 * @param options Optional. Object with `timeout` and `interval` properties.
			 */
			mailpitNotHasEmailsBySubject(
				subject: string,
				start?: number,
				limit?: number,
				options?: { timeout?: number; interval?: number },
			): Chainable;

			/**
			 * Get all mails from the mailbox using the recipient's email address.
			 * @param email
			 * @param start
			 * @param limit
			 */
			mailpitGetEmailsByTo(email: string, start?: number, limit?: number): Chainable<MessagesSummary>;

			/**
			 * Check if mails have emails sent to a specific email address.
			 * Automatically retries until the condition is met or timeout is reached.
			 * @param email
			 * @param start
			 * @param limit
			 * @param options Optional. Object with `timeout` and `interval` properties.
			 */
			mailpitHasEmailsByTo(
				email: string,
				start?: number,
				limit?: number,
				options?: { timeout?: number; interval?: number },
			): Chainable;

			/**
			 * Check if mails do not have emails sent to a specific email address.
			 * Automatically retries until the condition is met or timeout is reached.
			 * @param email
			 * @param start
			 * @param limit
			 * @param options Optional. Object with `timeout` and `interval` properties.
			 */
			mailpitNotHasEmailsByTo(
				email: string,
				start?: number,
				limit?: number,
				options?: { timeout?: number; interval?: number },
			): Chainable;

			/**
			 * Get the mail text body.
			 * @param message
			 */
			mailpitGetMailTextBody(message?: Message): Chainable<string>;

			/**
			 * Get the mail HTML body.
			 * @param message
			 */
			mailpitGetMailHTMlBody(message?: Message): Chainable<string>;

			/**
			 * Get the mail's "From" address.
			 * @param message
			 */
			mailpitGetFromAddress(message?: Message): Chainable<string>;

			/**
			 * Get the attachments of the mail.
			 * @param message
			 */
			mailpitGetAttachments(message?: Message): Chainable<string>;

			/**
			 * Get the mail SpamAssassin summary.
			 * @param message
			 */
			mailpitGetMailSpamAssassinSummary(message?: Message): Chainable<SpamAssassin>;

			/**
			 * Get the mail SpamAssassin summary.
			 * This is a deprecated method for backward compatibility.
			 * @param message
			 * @deprecated Use `mailpitGetMailSpamAssassinSummary` instead.
			 */
			mailpitGetMailSpamAssainSummary(message?: Message): Chainable<SpamAssassin>;

			/**
			 * Get the recipient addresses of the mail.
			 * @param message
			 */
			mailpitGetRecipientAddress(message?: Message): Chainable<Array<string>>;

			/**
			 * Get the subject of the mail.
			 * @param message
			 */
			mailpitGetSubject(message?: Message): Chainable<string>;

			/**
			 * Get the mail by ID.
			 * If ID is not provided, it will get the latest email.
			 * @param id
			 */
			mailpitGetMail(id?: string): Chainable<Message>;

			/**
			 * Send an email.
			 * If options are not provided, it will send a default email.
			 * @param options SendEmailOptions
			 */
			mailpitSendMail(options?: SendEmailOptions): Chainable<{ ID: string }>;

			/**
			 * Delete all emails from the mailbox.
			 */
			mailpitDeleteAllEmails(): Chainable<void>;

			/**
			 * Delete emails from the mailbox based on search query.
			 * @param query Search query to delete emails
			 */
			mailpitDeleteEmailsBySearch(query: string): Chainable<void>;

			/**
			 * Set the read status of one or more emails to read.
			 * @param messages Array of Message or MessageSummary objects to mark as read
			 */
			mailpitSetStatusAsRead(messages?: Message[] | Message | MessageSummary[] | MessageSummary | null): Chainable<string>;

			/**
			 * Set the read status of one or more emails to unread.
			 * @param messages Array of Message or MessageSummary objects to mark as unread
			 */
			mailpitSetStatusAsUnRead(
				messages?: Message[] | Message | MessageSummary[] | MessageSummary | null,
			): Chainable<string>;

			/**
			 * Set the read status of all emails to read.
			 */
			mailpitSetAllEmailStatusAsRead(): Chainable<void>;

			/**
			 * Set the read status of all emails to unread.
			 */
			mailpitSetAllEmailStatusAsUnRead(): Chainable<void>;
		}
	}
}
