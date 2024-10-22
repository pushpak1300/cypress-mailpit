import type { Message, MessageSummary, MessagesSummary, SendEmailOptions, SpamAssassin } from "./types";

class MailpitCommands {
	private readonly baseUrl: string;
	private readonly auth!: { user: string; pass: string } | undefined;

	static get parentCypressCommands(): string[] {
		return [
			"mailpitDeleteAllEmails",
			"mailpitGetAllMails",
			"mailpitGetEmailsBySubject",
			"mailpitGetMail",
			"mailpitSearchEmails",
			"mailpitSendMail",
			"mailpitHasEmailsBySubject",
			"mailpitGetEmailsByTo",
			"mailpitHasEmailsByTo",
			"mailpitNotHasEmailsBySubject",
			"mailpitNotHasEmailsByTo",
			"mailpitSetAllEmailStatusAsRead",
			"mailpitSetAllEmailStatusAsUnRead",
			"mailpitHasEmailsBySearch",
			"mailpitNotHasEmailsBySearch",
		];
	}

	static get childCypressCommands(): string[] {
		return [
			"mailpitGetFromAddress",
			"mailpitGetMailHTMlBody",
			"mailpitGetMailTextBody",
			"mailpitGetRecipientAddress",
			"mailpitGetSubject",
			"mailpitGetAttachments",
			"mailpitGetMailSpamAssassinSummary",
			"mailpitGetMailSpamAssainSummary", // deprecated only for backward compatibility
			"mailpitSetStatusAsRead",
			"mailpitSetStatusAsUnRead",
		];
	}

	private mailpitUrl(path: string, isApi = true): string {
		return `${this.baseUrl}/${isApi ? "api" : ""}${path}`;
	}

	constructor() {
		this.baseUrl = Cypress.env("MAILPIT_URL") ?? "http://localhost:8025";
		const user = Cypress.env("MAILPIT_USERNAME");
		const pass = Cypress.env("MAILPIT_PASSWORD");
		if (user && pass) {
			this.auth = {
				user: user,
				pass: pass,
			};
		}
	}

	mailpitGetAllMails(start = 0, limit = 50): Cypress.Chainable<MessagesSummary> {
		return cy
			.request({
				method: "GET",
				url: this.mailpitUrl(`/v1/messages?start=${start}&limit=${limit}`),
				auth: this.auth,
			})
			.then((response) => {
				if (response.status !== 200) {
					throw new Error(`Failed to get messages. Status: ${response.status}, Body: ${response.body}`);
				}
				return response.body as MessagesSummary;
			});
	}

	mailpitGetMail(id = "latest"): Cypress.Chainable<Message> {
		return cy
			.request({
				method: "GET",
				url: this.mailpitUrl(`/v1/message/${id}`),
				auth: this.auth,
			})
			.then((response) => {
				if (response.status !== 200) {
					throw new Error(`Failed to get messages. Status: ${response.status}, Body: ${response.body}`);
				}
				return response.body as Message;
			});
	}

	mailpitSendMail(options?: SendEmailOptions): Cypress.Chainable<{ ID: string }> {
		const body = {
			Attachments: options?.attachments ?? [],
			Bcc: options?.bcc ?? ["bcc@example.com"],
			Cc: options?.cc ?? [{ Email: "cc@example.com", Name: "CC" }],
			From: options?.from ?? { Email: "from@example.com", Name: "From" },
			HTML: options?.htmlBody ?? "<p>hello from mailpit</p>",
			Headers: options?.headers ?? {},
			ReplyTo: options?.replyTo ?? [{ Email: "replyto@example.com", Name: "ReplyTo" }],
			Subject: options?.subject ?? "Hello Mailpit",
			Tags: options?.tags ?? [],
			Text: options?.textBody ?? "hello from mailpit",
			To: options?.to ?? [{ Email: "jane@example.com", Name: "Jane" }],
		};
		return cy
			.request({
				method: "POST",
				url: this.mailpitUrl("/v1/send"),
				body: body,
				auth: this.auth,
			})
			.then((response) => {
				if (response.status !== 200) {
					throw new Error(`Failed to send email. Status: ${response.status}, Body: ${response.body}`);
				}
				return response.body as { ID: string };
			});
	}

	mailpitSearchEmails(query: string, start = 0, limit = 50): Cypress.Chainable<MessagesSummary> {
		return cy
			.request({
				method: "GET",
				url: this.mailpitUrl("/v1/search"),
				qs: {
					query: query,
					start: start,
					limit: limit,
				},
				auth: this.auth,
			})
			.then((response) => {
				if (response.status !== 200) {
					throw new Error(`Failed to get messages. Status: ${response.status}, Body: ${response.body}`);
				}
				return response.body as MessagesSummary;
			});
	}

	mailpitGetEmailsBySubject(subject: string, start = 0, limit = 50): Cypress.Chainable<MessagesSummary> {
		return this.mailpitSearchEmails(`subject:${subject}`, start, limit);
	}

	mailpitHasEmailsBySearch(
		query: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number } = {},
	): Cypress.Chainable<MessagesSummary> {
		return this.waitForCondition(
			() => this.mailpitSearchEmails(query, start, limit),
			(result) => result.messages_count > 0,
			options,
		);
	}

	mailpitNotHasEmailsBySearch(
		query: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number } = {},
	): Cypress.Chainable<MessagesSummary> {
		return this.waitForCondition(
			() => this.mailpitSearchEmails(query, start, limit),
			(result) => result.messages_count === 0,
			options,
		);
	}

	mailpitHasEmailsBySubject(
		subject: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number } = {},
	): Cypress.Chainable<MessagesSummary> {
		return this.waitForCondition(
			() => this.mailpitGetEmailsBySubject(subject, start, limit),
			(result) => result.messages_count > 0,
			options,
		);
	}

	mailpitNotHasEmailsBySubject(
		subject: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number } = {},
	): Cypress.Chainable<MessagesSummary> {
		return this.waitForCondition(
			() => this.mailpitGetEmailsBySubject(subject, start, limit),
			(result) => result.messages_count === 0,
			options,
		);
	}

	mailpitGetEmailsByTo(email: string, start = 0, limit = 50): Cypress.Chainable<MessagesSummary> {
		return this.mailpitSearchEmails(`to:${email}`, start, limit);
	}

	mailpitHasEmailsByTo(
		email: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number } = {},
	): Cypress.Chainable<MessagesSummary> {
		return this.waitForCondition(
			() => this.mailpitGetEmailsByTo(email, start, limit),
			(result) => result.messages_count > 0,
			options,
		);
	}

	mailpitNotHasEmailsByTo(
		email: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number } = {},
	): Cypress.Chainable<MessagesSummary> {
		return this.waitForCondition(
			() => this.mailpitGetEmailsByTo(email, start, limit),
			(result) => result.messages_count === 0,
			options,
		);
	}

	mailpitDeleteAllEmails(): Cypress.Chainable<Cypress.Response<void>> {
		return cy.request({
			method: "DELETE",
			url: this.mailpitUrl("/v1/messages"),
			auth: this.auth,
		});
	}

	// Single Mail Assertions
	mailpitGetSubject(message: Message): Cypress.Chainable<string> {
		return cy.wrap(message.Subject);
	}

	mailpitGetRecipientAddress(message: Message): Cypress.Chainable<Array<string>> {
		return cy.wrap(message.To.map((recipient) => recipient.Address));
	}

	mailpitGetFromAddress(message: Message): Cypress.Chainable<string> {
		return cy.wrap(message.From.Address);
	}

	mailpitGetAttachments(message: Message): Cypress.Chainable<Array<string>> {
		return cy.wrap(message.Attachments.map((attachment) => attachment.FileName));
	}

	mailpitGetMailSpamAssassinSummary(message: Message): Cypress.Chainable<SpamAssassin> {
		const messageId = message.ID;
		return cy
			.request({
				method: "GET",
				url: this.mailpitUrl(`/v1/message/${messageId}/sa-check`),
				auth: this.auth,
			})
			.then((response) => {
				if (response.status !== 200) {
					throw new Error(`Failed to get message body. Status: ${response.status}, Body: ${response.body}`);
				}
				return response.body as SpamAssassin;
			});
	}

	/**
	 * Get the mail spam assassin summary.
	 * This is a deprecated method.
	 * Only for backward compatibility.
	 * @param message
	 */
	mailpitGetMailSpamAssainSummary(message: Message): Cypress.Chainable<SpamAssassin> {
		return this.mailpitGetMailSpamAssassinSummary(message);
	}

	mailpitGetMailHTMlBody(message: Message): Cypress.Chainable<string> {
		const messageId = message.ID;
		return cy
			.request({
				method: "GET",
				url: this.mailpitUrl(`/view/${messageId}.html`, false),
				auth: this.auth,
			})
			.then((response) => {
				if (response.status !== 200) {
					throw new Error(`Failed to get message body. Status: ${response.status}, Body: ${response.body}`);
				}
				return response.body as string;
			});
	}

	mailpitGetMailTextBody(message: Message): Cypress.Chainable<string> {
		const messageId = message.ID;
		return cy
			.request({
				method: "GET",
				url: this.mailpitUrl(`/view/${messageId}.txt`, false),
				auth: this.auth,
			})
			.then((response) => {
				if (response.status !== 200) {
					throw new Error(`Failed to get message body. Status: ${response.status}, Body: ${response.body}`);
				}
				return response.body as string;
			});
	}

	private setReadStatus(
		messages: Message[] | Message | MessageSummary[] | MessageSummary | null,
		isRead: boolean,
	): Cypress.Chainable<string> {
		let messageIds: string[] = [];

		if (messages) {
			if (Array.isArray(messages)) {
				messageIds = messages.map((message) => message.ID);
			} else if ("ID" in messages) {
				messageIds = [messages.ID];
			}
		}

		const body = {
			IDs: messageIds,
			Read: isRead,
		};

		return cy
			.request({
				method: "PUT",
				url: this.mailpitUrl("/v1/messages"),
				body: body,
				auth: this.auth,
			})
			.then((response) => {
				if (response.status !== 200) {
					throw new Error(
						`Failed to set ${isRead ? "read" : "unread"} status. Status: ${response.status}, Body: ${response.body}`,
					);
				}
				return response.body as string;
			});
	}

	mailpitSetAllEmailStatusAsRead(): Cypress.Chainable<string> {
		return this.setReadStatus(null, true);
	}

	mailpitSetAllEmailStatusAsUnRead(): Cypress.Chainable<string> {
		return this.setReadStatus(null, false);
	}

	mailpitSetStatusAsRead(messages: Message[] | Message | MessageSummary[] | MessageSummary): Cypress.Chainable<string> {
		return this.setReadStatus(messages, true);
	}

	mailpitSetStatusAsUnRead(
		messages: Message[] | Message | MessageSummary[] | MessageSummary,
	): Cypress.Chainable<string> {
		return this.setReadStatus(messages, false);
	}

	private waitForCondition<T>(
		fn: () => Cypress.Chainable<T>,
		condition: (result: T) => boolean,
		options: { timeout?: number; interval?: number } = {},
	): Cypress.Chainable<T> {
		const timeout = options.timeout ?? Cypress.config("defaultCommandTimeout");
		const interval = options.interval ?? 500;
		if (interval > timeout) {
			throw new Error(`Interval ${interval} cannot be greater than timeout ${timeout}`);
		}
		const startTime = Date.now();

		const check = (): Cypress.Chainable<T> => {
			return fn().then((result) => {
				if (condition(result)) {
					return cy.wrap(result);
				}
				if (Date.now() - startTime < timeout) {
					return cy.wait(interval).then(check);
				}

				throw new Error(`Timed out after ${timeout}ms waiting for condition`);
			});
		};

		return check();
	}
}

export { MailpitCommands };
