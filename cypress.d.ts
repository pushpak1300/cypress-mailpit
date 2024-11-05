import type { Message, MessageSummary, MessagesSummary, SendEmailOptions, SpamAssassin } from "./src/types";

/// <reference types="cypress" />
declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Get all mails from the mailbox.
			 * @param start
			 * @param limit
			 * @param options
			 */
			mailpitGetAllMails(start?: number, limit?: number, options?: { log?: boolean }): Chainable<MessagesSummary>;

			/**
			 * Search all mails from the mailbox using query.
			 * @param query
			 * @param start
			 * @param limit
			 * @param options
			 */
			mailpitSearchEmails(query: string, start?: number, limit?: number, options?: { log?: boolean }): Chainable<MessagesSummary>;

			/**
			 * Get all mails from the mailbox using subject.
			 * @param subject
			 * @param start
			 * @param limit
			 * @param options
			 */
			mailpitGetEmailsBySubject(subject: string, start?: number, limit?: number, options?: { log?: boolean }): Chainable<MessagesSummary>;

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
				options?: { timeout?: number; interval?: number, log?: boolean },
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
				options?: { timeout?: number; interval?: number, log?: boolean },
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
				options?: { timeout?: number; interval?: number, log?: boolean },
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
				options?: { timeout?: number; interval?: number, log?: boolean },
			): Chainable;

			/**
			 * Get all mails from the mailbox using the recipient's email address.
			 * @param email
			 * @param start
			 * @param limit
			 * @param options
			 */
			mailpitGetEmailsByTo(email: string, start?: number, limit?: number, options?: { log?: boolean }): Chainable<MessagesSummary>;

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
				options?: { timeout?: number; interval?: number, log?: boolean },
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
				options?: { timeout?: number; interval?: number, log?: boolean },
			): Chainable;

			/**
			 * Get the mail text body.
			 * @param message
			 * @param options
			 */
			mailpitGetMailTextBody(message?: Message, options?: { log?: boolean }): Chainable<string>;

			/**
			 * Get the mail HTML body.
			 * @param message
			 * @param options
			 */
			mailpitGetMailHTMlBody(message?: Message, options?: { log?: boolean }): Chainable<string>;

			/**
			 * Get the mail's "From" address.
			 * @param message
			 * @param options
			 */
			mailpitGetFromAddress(message?: Message, options?: { log?: boolean }): Chainable<string>;

			/**
			 * Get the attachments of the mail.
			 * @param message
			 * @param options
			 */
			mailpitGetAttachments(message?: Message, options?: { log?: boolean }): Chainable<string>;

			/**
			 * Get the mail SpamAssassin summary.
			 * @param message
			 * @param options
			 */
			mailpitGetMailSpamAssassinSummary(message?: Message, options?: { log?: boolean }): Chainable<SpamAssassin>;

			/**
			 * Get the mail SpamAssassin summary.
			 * This is a deprecated method for backward compatibility.
			 * @param message
			 * @param options
			 * @deprecated Use `mailpitGetMailSpamAssassinSummary` instead.
			 */
			mailpitGetMailSpamAssainSummary(message?: Message, options?: { log?: boolean }): Chainable<SpamAssassin>;

			/**
			 * Get the recipient addresses of the mail.
			 * @param message
			 * @param options
			 */
			mailpitGetRecipientAddress(message?: Message, options?: { log?: boolean }): Chainable<Array<string>>;

			/**
			 * Get the subject of the mail.
			 * @param message
			 * @param options
			 */
			mailpitGetSubject(message?: Message, options?: { log?: boolean }): Chainable<string>;

			/**
			 * Get the mail by ID.
			 * If ID is not provided, it will get the latest email.
			 * @param id
			 * @param options
			 */
			mailpitGetMail(id?: string, options?: { log?: boolean }): Chainable<Message>;

			/**
			 * Send an email.
			 * If options are not provided, it will send a default email.
			 * @param sendOptions SendEmailOptions
			 * @param options
			 */
			mailpitSendMail(sendOptions?: SendEmailOptions, options?: { log?: boolean }): Chainable<{ ID: string }>;

			/**
			 * Delete all emails from the mailbox.
			 */
			mailpitDeleteAllEmails(options?: { log?: boolean }): Chainable<string>;

			/**
			 * Delete emails from the mailbox based on search query.
			 * @param query Search query to delete emails
			 * @param options
			 */
			mailpitDeleteEmailsBySearch(query: string, options?: { log?: boolean }): Chainable<string>;

			/**
			 * Set the read status of one or more emails to read.
			 * @param messages Array of Message or MessageSummary objects to mark as read
			 * @param options
			 */
			mailpitSetStatusAsRead(messages?: Message[] | Message | MessageSummary[] | MessageSummary | null, options?: { log?: boolean }): Chainable<string>;

			/**
			 * Set the read status of one or more emails to unread.
			 * @param messages Array of Message or MessageSummary objects to mark as unread
			 * @param options
			 */
			mailpitSetStatusAsUnRead(
				messages?: Message[] | Message | MessageSummary[] | MessageSummary | null,
				options?: { log?: boolean }
			): Chainable<string>;

			/**
			 * Set the read status of all emails to read.
			 */
			mailpitSetAllEmailStatusAsRead(options?: { log?: boolean }): Chainable<string>;

			/**
			 * Set the read status of all emails to unread.
			 */
			mailpitSetAllEmailStatusAsUnRead(options?: { log?: boolean }): Chainable<string>;
		}
	}
}
