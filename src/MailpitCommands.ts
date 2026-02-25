import type { Message, MessageSummary, MessagesSummary, SendEmailOptions, SpamAssassin } from "./types";

class MailpitCommands {
	private readonly baseUrl: string;

	static get parentCypressCommands(): string[] {
		return [
			"mailpitDeleteAllEmails",
			"mailpitDeleteEmailsBySearch",
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
		this.baseUrl = Cypress.expose("MAILPIT_URL") ?? "http://localhost:8025";
	}

	private resolveAuth(): Cypress.Chainable<{ user: string; pass: string } | undefined> {
		return cy.env(["MAILPIT_USERNAME", "MAILPIT_PASSWORD"]).then((env) => {
			const user = (env as Record<string, string>).MAILPIT_USERNAME;
			const pass = (env as Record<string, string>).MAILPIT_PASSWORD;
			if (user && pass) {
				return cy.wrap<{ user: string; pass: string } | undefined>({ user, pass }, { log: false });
			}
			return cy.wrap<{ user: string; pass: string } | undefined>(undefined, { log: false });
		});
	}

	private request(options: Partial<Cypress.RequestOptions>): Cypress.Chainable<Cypress.Response<unknown>> {
		return this.resolveAuth().then((auth) => {
			return cy.request({ ...options, auth, log: false });
		});
	}

	mailpitGetAllMails(start = 0, limit = 50): Cypress.Chainable<MessagesSummary> {
		let yielded: MessagesSummary;
		Cypress.log({
			name: "mailpitGetAllMails",
			displayName: "getAllMails",
			message: "",
			consoleProps: () => ({
				Yielded: yielded,
				"Messages Count": yielded?.messages_count,
			}),
		});
		return this.request({
			method: "GET",
			url: this.mailpitUrl(`/v1/messages?start=${start}&limit=${limit}`),
		}).then((response) => {
			yielded = response.body as MessagesSummary;
			return yielded;
		});
	}

	mailpitGetMail(id = "latest"): Cypress.Chainable<Message> {
		let yielded: Message;
		Cypress.log({
			name: "mailpitGetMail",
			displayName: "getMail",
			message: id,
			consoleProps: () => ({
				ID: id,
				Yielded: yielded,
			}),
		});
		return this.request({
			method: "GET",
			url: this.mailpitUrl(`/v1/message/${id}`),
		}).then((response) => {
			yielded = response.body as Message;
			return yielded;
		});
	}

	mailpitSendMail(options?: SendEmailOptions): Cypress.Chainable<{ ID: string }> {
		let yielded: { ID: string };
		const to = options?.to ?? [{ Email: "jane@example.com", Name: "Jane" }];
		const subject = options?.subject ?? "Hello Mailpit";
		Cypress.log({
			name: "mailpitSendMail",
			displayName: "sendMail",
			message: subject,
			consoleProps: () => ({
				Subject: subject,
				To: to.map((r) => r.Email).join(", "),
				Yielded: yielded,
			}),
		});
		const body = {
			Attachments: options?.attachments ?? [],
			Bcc: options?.bcc ?? ["bcc@example.com"],
			Cc: options?.cc ?? [{ Email: "cc@example.com", Name: "CC" }],
			From: options?.from ?? { Email: "from@example.com", Name: "From" },
			HTML: options?.htmlBody ?? "<p>hello from mailpit</p>",
			Headers: options?.headers ?? {},
			ReplyTo: options?.replyTo ?? [{ Email: "replyto@example.com", Name: "ReplyTo" }],
			Subject: subject,
			Tags: options?.tags ?? [],
			Text: options?.textBody ?? "hello from mailpit",
			To: to,
		};
		return this.request({
			method: "POST",
			url: this.mailpitUrl("/v1/send"),
			body: body,
		}).then((response) => {
			yielded = response.body as { ID: string };
			return yielded;
		});
	}

	mailpitSearchEmails(query: string, start = 0, limit = 50): Cypress.Chainable<MessagesSummary> {
		let yielded: MessagesSummary;
		Cypress.log({
			name: "mailpitSearchEmails",
			displayName: "searchEmails",
			message: query,
			consoleProps: () => ({
				Query: query,
				Yielded: yielded,
				"Messages Count": yielded?.messages_count,
			}),
		});
		return this.request({
			method: "GET",
			url: this.mailpitUrl("/v1/search"),
			qs: {
				query: query,
				start: start,
				limit: limit,
			},
		}).then((response) => {
			yielded = response.body as MessagesSummary;
			return yielded;
		});
	}

	mailpitGetEmailsBySubject(subject: string, start = 0, limit = 50): Cypress.Chainable<MessagesSummary> {
		let yielded: MessagesSummary;
		Cypress.log({
			name: "mailpitGetEmailsBySubject",
			displayName: "getEmailsBySubject",
			message: subject,
			consoleProps: () => ({
				Subject: subject,
				Yielded: yielded,
				"Messages Count": yielded?.messages_count,
			}),
		});
		return this.searchEmails(`subject:${subject}`, start, limit).then((result) => {
			yielded = result;
			return result;
		});
	}

	mailpitHasEmailsBySearch(
		query: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number } = {},
	): Cypress.Chainable<MessagesSummary> {
		let yielded: MessagesSummary;
		Cypress.log({
			name: "mailpitHasEmailsBySearch",
			displayName: "hasEmailsBySearch",
			message: query,
			consoleProps: () => ({
				Query: query,
				Yielded: yielded,
				"Messages Count": yielded?.messages_count,
			}),
		});
		return this.waitForCondition(
			() => this.searchEmails(query, start, limit),
			(result) => result.messages_count > 0,
			options,
		).then((result) => {
			yielded = result;
			return result;
		});
	}

	mailpitNotHasEmailsBySearch(
		query: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number } = {},
	): Cypress.Chainable<MessagesSummary> {
		let yielded: MessagesSummary;
		Cypress.log({
			name: "mailpitNotHasEmailsBySearch",
			displayName: "notHasEmailsBySearch",
			message: query,
			consoleProps: () => ({
				Query: query,
				Yielded: yielded,
				"Messages Count": yielded?.messages_count,
			}),
		});
		return this.waitForCondition(
			() => this.searchEmails(query, start, limit),
			(result) => result.messages_count === 0,
			options,
		).then((result) => {
			yielded = result;
			return result;
		});
	}

	mailpitHasEmailsBySubject(
		subject: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number } = {},
	): Cypress.Chainable<MessagesSummary> {
		let yielded: MessagesSummary;
		Cypress.log({
			name: "mailpitHasEmailsBySubject",
			displayName: "hasEmailsBySubject",
			message: subject,
			consoleProps: () => ({
				Subject: subject,
				Yielded: yielded,
				"Messages Count": yielded?.messages_count,
			}),
		});
		return this.waitForCondition(
			() => this.searchEmails(`subject:${subject}`, start, limit),
			(result) => result.messages_count > 0,
			options,
		).then((result) => {
			yielded = result;
			return result;
		});
	}

	mailpitNotHasEmailsBySubject(
		subject: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number } = {},
	): Cypress.Chainable<MessagesSummary> {
		let yielded: MessagesSummary;
		Cypress.log({
			name: "mailpitNotHasEmailsBySubject",
			displayName: "notHasEmailsBySubject",
			message: subject,
			consoleProps: () => ({
				Subject: subject,
				Yielded: yielded,
				"Messages Count": yielded?.messages_count,
			}),
		});
		return this.waitForCondition(
			() => this.searchEmails(`subject:${subject}`, start, limit),
			(result) => result.messages_count === 0,
			options,
		).then((result) => {
			yielded = result;
			return result;
		});
	}

	mailpitGetEmailsByTo(email: string, start = 0, limit = 50): Cypress.Chainable<MessagesSummary> {
		let yielded: MessagesSummary;
		Cypress.log({
			name: "mailpitGetEmailsByTo",
			displayName: "getEmailsByTo",
			message: email,
			consoleProps: () => ({
				Email: email,
				Yielded: yielded,
				"Messages Count": yielded?.messages_count,
			}),
		});
		return this.searchEmails(`to:${email}`, start, limit).then((result) => {
			yielded = result;
			return result;
		});
	}

	mailpitHasEmailsByTo(
		email: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number } = {},
	): Cypress.Chainable<MessagesSummary> {
		let yielded: MessagesSummary;
		Cypress.log({
			name: "mailpitHasEmailsByTo",
			displayName: "hasEmailsByTo",
			message: email,
			consoleProps: () => ({
				Email: email,
				Yielded: yielded,
				"Messages Count": yielded?.messages_count,
			}),
		});
		return this.waitForCondition(
			() => this.searchEmails(`to:${email}`, start, limit),
			(result) => result.messages_count > 0,
			options,
		).then((result) => {
			yielded = result;
			return result;
		});
	}

	mailpitNotHasEmailsByTo(
		email: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number } = {},
	): Cypress.Chainable<MessagesSummary> {
		let yielded: MessagesSummary;
		Cypress.log({
			name: "mailpitNotHasEmailsByTo",
			displayName: "notHasEmailsByTo",
			message: email,
			consoleProps: () => ({
				Email: email,
				Yielded: yielded,
				"Messages Count": yielded?.messages_count,
			}),
		});
		return this.waitForCondition(
			() => this.searchEmails(`to:${email}`, start, limit),
			(result) => result.messages_count === 0,
			options,
		).then((result) => {
			yielded = result;
			return result;
		});
	}

	mailpitDeleteAllEmails(): Cypress.Chainable<Cypress.Response<void>> {
		Cypress.log({
			name: "mailpitDeleteAllEmails",
			displayName: "deleteAllEmails",
			message: "",
			consoleProps: () => ({}),
		});
		return this.request({
			method: "DELETE",
			url: this.mailpitUrl("/v1/messages"),
		}) as Cypress.Chainable<Cypress.Response<void>>;
	}

	mailpitDeleteEmailsBySearch(query: string): Cypress.Chainable<Cypress.Response<void>> {
		Cypress.log({
			name: "mailpitDeleteEmailsBySearch",
			displayName: "deleteEmailsBySearch",
			message: query,
			consoleProps: () => ({
				Query: query,
			}),
		});
		return this.request({
			method: "DELETE",
			url: this.mailpitUrl("/v1/search"),
			qs: {
				query: query,
			},
		}) as Cypress.Chainable<Cypress.Response<void>>;
	}

	// Single Mail Assertions
	mailpitGetSubject(message: Message): Cypress.Chainable<string> {
		Cypress.log({
			name: "mailpitGetSubject",
			displayName: "getSubject",
			message: message.Subject,
			consoleProps: () => ({
				Yielded: message.Subject,
			}),
		});
		return cy.wrap(message.Subject, { log: false });
	}

	mailpitGetRecipientAddress(message: Message): Cypress.Chainable<Array<string>> {
		const addresses = message.To.map((recipient) => recipient.Address);
		Cypress.log({
			name: "mailpitGetRecipientAddress",
			displayName: "getRecipientAddress",
			message: addresses.join(", "),
			consoleProps: () => ({
				Yielded: addresses,
			}),
		});
		return cy.wrap(addresses, { log: false });
	}

	mailpitGetFromAddress(message: Message): Cypress.Chainable<string> {
		Cypress.log({
			name: "mailpitGetFromAddress",
			displayName: "getFromAddress",
			message: message.From.Address,
			consoleProps: () => ({
				Yielded: message.From.Address,
			}),
		});
		return cy.wrap(message.From.Address, { log: false });
	}

	mailpitGetAttachments(message: Message): Cypress.Chainable<Array<string>> {
		const filenames = message.Attachments.map((attachment) => attachment.FileName);
		Cypress.log({
			name: "mailpitGetAttachments",
			displayName: "getAttachments",
			message: filenames.join(", "),
			consoleProps: () => ({
				Yielded: filenames,
			}),
		});
		return cy.wrap(filenames, { log: false });
	}

	mailpitGetMailSpamAssassinSummary(message: Message): Cypress.Chainable<SpamAssassin> {
		const messageId = message.ID;
		let yielded: SpamAssassin;
		Cypress.log({
			name: "mailpitGetMailSpamAssassinSummary",
			displayName: "getSpamSummary",
			message: "",
			consoleProps: () => ({
				"Message ID": messageId,
				Yielded: yielded,
			}),
		});
		return this.request({
			method: "GET",
			url: this.mailpitUrl(`/v1/message/${messageId}/sa-check`),
		}).then((response) => {
			yielded = response.body as SpamAssassin;
			return yielded;
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
		let yielded: string;
		Cypress.log({
			name: "mailpitGetMailHTMlBody",
			displayName: "getMailHTMLBody",
			message: "",
			consoleProps: () => ({
				"Message ID": messageId,
				Yielded: yielded,
			}),
		});
		return this.request({
			method: "GET",
			url: this.mailpitUrl(`/view/${messageId}.html`, false),
		}).then((response) => {
			yielded = response.body as string;
			return yielded;
		});
	}

	mailpitGetMailTextBody(message: Message): Cypress.Chainable<string> {
		const messageId = message.ID;
		let yielded: string;
		Cypress.log({
			name: "mailpitGetMailTextBody",
			displayName: "getMailTextBody",
			message: "",
			consoleProps: () => ({
				"Message ID": messageId,
				Yielded: yielded,
			}),
		});
		return this.request({
			method: "GET",
			url: this.mailpitUrl(`/view/${messageId}.txt`, false),
		}).then((response) => {
			yielded = response.body as string;
			return yielded;
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

		return this.request({
			method: "PUT",
			url: this.mailpitUrl("/v1/messages"),
			body: body,
		}).then((response) => response.body as string);
	}

	mailpitSetAllEmailStatusAsRead(): Cypress.Chainable<string> {
		Cypress.log({
			name: "mailpitSetAllEmailStatusAsRead",
			displayName: "setAllAsRead",
			message: "",
			consoleProps: () => ({}),
		});
		return this.setReadStatus(null, true);
	}

	mailpitSetAllEmailStatusAsUnRead(): Cypress.Chainable<string> {
		Cypress.log({
			name: "mailpitSetAllEmailStatusAsUnRead",
			displayName: "setAllAsUnRead",
			message: "",
			consoleProps: () => ({}),
		});
		return this.setReadStatus(null, false);
	}

	mailpitSetStatusAsRead(messages: Message[] | Message | MessageSummary[] | MessageSummary): Cypress.Chainable<string> {
		Cypress.log({
			name: "mailpitSetStatusAsRead",
			displayName: "setAsRead",
			message: "",
			consoleProps: () => ({}),
		});
		return this.setReadStatus(messages, true);
	}

	mailpitSetStatusAsUnRead(
		messages: Message[] | Message | MessageSummary[] | MessageSummary,
	): Cypress.Chainable<string> {
		Cypress.log({
			name: "mailpitSetStatusAsUnRead",
			displayName: "setAsUnRead",
			message: "",
			consoleProps: () => ({}),
		});
		return this.setReadStatus(messages, false);
	}

	private searchEmails(query: string, start = 0, limit = 50): Cypress.Chainable<MessagesSummary> {
		return this.request({
			method: "GET",
			url: this.mailpitUrl("/v1/search"),
			qs: {
				query: query,
				start: start,
				limit: limit,
			},
		}).then((response) => response.body as MessagesSummary);
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
					return cy.wrap(result, { log: false });
				}
				if (Date.now() - startTime < timeout) {
					return cy.wait(interval, { log: false }).then(check);
				}

				throw new Error(`Timed out after ${timeout}ms waiting for condition`);
			});
		};

		return check();
	}
}

export { MailpitCommands };
