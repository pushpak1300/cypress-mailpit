import type { Message, MessageSummary, MessagesSummary, SendEmailOptions, SpamAssassin } from "./types";

class MailpitCommands {
	private readonly baseUrl: string;
	private readonly auth!: { user: string; pass: string } | undefined;

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

	mailpitGetAllMails(start = 0, limit = 50, options: { log?: boolean } = { log: true }): Cypress.Chainable<MessagesSummary> {
		let consoleProps = { start, limit };
		const log = this.getLog('mailpitGetAllMails', 'get all mails', consoleProps, options);

		return cy
			.request({
				method: "GET",
				url: this.mailpitUrl(`/v1/messages?start=${start}&limit=${limit}`),
				auth: this.auth,
				log: false
			})
			.its('body', {log: false})
			.then(body => this.setConsoleProps(log, consoleProps, body));
	}

	mailpitGetMail(id = "latest", options: { log?: boolean } = { log: true }): Cypress.Chainable<Message> {
		let consoleProps = { id };
		const log = this.getLog('mailpitGetMail', 'get mail', consoleProps, options);

		return cy
			.request({
				method: "GET",
				url: this.mailpitUrl(`/v1/message/${id}`),
				auth: this.auth,
				log: false
			})
			.its('body', {log: false})
			.then(body => this.setConsoleProps(log, consoleProps, body));
	}

	mailpitSendMail(sendOptions?: SendEmailOptions, options: { log?: boolean } = { log: true }): Cypress.Chainable<{ ID: string }> {
		let consoleProps = { ...sendOptions  && { options: sendOptions } };
		const log = this.getLog('mailpitSendMail', 'send mail', consoleProps, options);

		const body = {
			Attachments: sendOptions?.attachments ?? [],
			Bcc: sendOptions?.bcc ?? ["bcc@example.com"],
			Cc: sendOptions?.cc ?? [{ Email: "cc@example.com", Name: "CC" }],
			From: sendOptions?.from ?? { Email: "from@example.com", Name: "From" },
			HTML: sendOptions?.htmlBody ?? "<p>hello from mailpit</p>",
			Headers: sendOptions?.headers ?? {},
			ReplyTo: sendOptions?.replyTo ?? [{ Email: "replyto@example.com", Name: "ReplyTo" }],
			Subject: sendOptions?.subject ?? "Hello Mailpit",
			Tags: sendOptions?.tags ?? [],
			Text: sendOptions?.textBody ?? "hello from mailpit",
			To: sendOptions?.to ?? [{ Email: "jane@example.com", Name: "Jane" }],
		};
		return cy
			.request({
				method: "POST",
				url: this.mailpitUrl("/v1/send"),
				body: body,
				auth: this.auth,
				log: false
			})
			.its('body', {log: false})
			.then(id => this.setConsoleProps(log, consoleProps, id));
	}

	mailpitSearchEmails(query: string, start = 0, limit = 50, options: { log?: boolean } = { log: true }): Cypress.Chainable<MessagesSummary> {
		let consoleProps = { query, start, limit };
		const log = this.getLog('mailpitSearchEmails', 'search mails', consoleProps, options);

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
				log: false
			})
			.its('body', {log: false})
			.then(body => this.setConsoleProps(log, consoleProps, body));
	}

	mailpitGetEmailsBySubject(subject: string, start = 0, limit = 50, options: { log?: boolean } = { log: true }): Cypress.Chainable<MessagesSummary> {
		let consoleProps = { subject, start, limit };
		const log = this.getLog('mailpitGetEmailsBySubject', 'get emails by subject', consoleProps, options);

		return this.mailpitSearchEmails(`subject:${subject}`, start, limit, { log: false })
			.then(body => this.setConsoleProps(log, consoleProps, body));
	}

	mailpitHasEmailsBySearch(
		query: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number; log?: boolean } = { log: true },
	): Cypress.Chainable<MessagesSummary> {
		let consoleProps = { query, start, limit, ...options.timeout && { timeout: options.timeout  }, ...options.interval && { interval: options.interval }};
		const log = this.getLog('mailpitHasEmailsBySearch', 'has emails by search', consoleProps, options);

		return this.waitForCondition(
			() => this.mailpitSearchEmails(query, start, limit, { log: false}),
			(result) => result.messages_count > 0,
			options,
		).then(messageSummary => this.setConsoleProps(log, consoleProps, messageSummary));
	}

	mailpitNotHasEmailsBySearch(
		query: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number; log?: boolean } = { log: true },
	): Cypress.Chainable<MessagesSummary> {
		let consoleProps = { query, start, limit, ...options.timeout && { timeout: options.timeout  }, ...options.interval && { interval: options.interval }};
		const log = this.getLog('mailpitHasEmailsBySearch', 'not has emails by search', consoleProps, options);

		return this.waitForCondition(
			() => this.mailpitSearchEmails(query, start, limit),
			(result) => result.messages_count === 0,
			options,
		).then(messageSummary => this.setConsoleProps(log, consoleProps, messageSummary));
	}

	mailpitHasEmailsBySubject(
		subject: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number; log?: boolean } = { log: true },
	): Cypress.Chainable<MessagesSummary> {
		let consoleProps = { subject, start, limit, ...options.timeout && { timeout: options.timeout  }, ...options.interval && { interval: options.interval }};
		const log = this.getLog('mailpitHasEmailsBySubject', 'has emails by subject', consoleProps, options);

		return this.waitForCondition(
			() => this.mailpitGetEmailsBySubject(subject, start, limit, { log: false}),
			(result) => result.messages_count > 0,
			options,
		).then(messageSummary => this.setConsoleProps(log, consoleProps, messageSummary));
	}

	mailpitNotHasEmailsBySubject(
		subject: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number; log?: boolean } = { log: true },
	): Cypress.Chainable<MessagesSummary> {
		let consoleProps = { subject, start, limit, ...options.timeout && { timeout: options.timeout  }, ...options.interval && { interval: options.interval }};
		const log = this.getLog('mailpitNotHasEmailsBySubject', 'not has emails by subject', consoleProps, options);

		return this.waitForCondition(
			() => this.mailpitGetEmailsBySubject(subject, start, limit, { log: false}),
			(result) => result.messages_count === 0,
			options,
		).then(messageSummary => this.setConsoleProps(log, consoleProps, messageSummary));
	}

	mailpitGetEmailsByTo(email: string, start = 0, limit = 50, options: { log?: boolean } = { log: true }): Cypress.Chainable<MessagesSummary> {
		let consoleProps = { email, start, limit };
		const log = this.getLog('mailpitGetEmailsByTo', 'get emails by to', consoleProps, options);

		return this.mailpitSearchEmails(`to:${email}`, start, limit, { log: false})
			.then(messageSummary => this.setConsoleProps(log, consoleProps, messageSummary));
	}

	mailpitHasEmailsByTo(
		email: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number; log?: boolean } = { log: true },
	): Cypress.Chainable<MessagesSummary> {
		let consoleProps = { email, start, limit, ...options.timeout && { timeout: options.timeout  }, ...options.interval && { interval: options.interval }};
		const log = this.getLog('mailpitHasEmailsByTo', 'has emails by to', consoleProps, options);
		
		return this.waitForCondition(
			() => this.mailpitGetEmailsByTo(email, start, limit, { log: false}),
			(result) => result.messages_count > 0,
			options,
		).then(messageSummary => this.setConsoleProps(log, consoleProps, messageSummary));
	}

	mailpitNotHasEmailsByTo(
		email: string,
		start = 0,
		limit = 50,
		options: { timeout?: number; interval?: number; log?: boolean } = { log: true },
	): Cypress.Chainable<MessagesSummary> {
		let consoleProps = { email, start, limit, ...options.timeout && { timeout: options.timeout  }, ...options.interval && { interval: options.interval }};
		const log = this.getLog('mailpitNotHasEmailsByTo', 'not has emails by to', consoleProps, options);

		return this.waitForCondition(
			() => this.mailpitGetEmailsByTo(email, start, limit, { log: false}),
			(result) => result.messages_count === 0,
			options,
		).then(messageSummary => this.setConsoleProps(log, consoleProps, messageSummary));
	}

	mailpitDeleteAllEmails(options: { log?: boolean } = { log: true }): Cypress.Chainable<Cypress.Response<string>> {
		let consoleProps = {};
		const log = this.getLog('mailpitDeleteAllEmails', 'delete all mails', consoleProps, options);

		return cy.request({
			method: "DELETE",
			url: this.mailpitUrl("/v1/messages"),
			auth: this.auth,
			log: false
		}).its('body', { log: false})
			.then(status => this.setConsoleProps(log, consoleProps, status));
	}

	mailpitDeleteEmailsBySearch(query: string, options: { log?: boolean } = { log: true }): Cypress.Chainable<Cypress.Response<string>> {
		let consoleProps = { query };
		const log = this.getLog('mailpitDeleteAllEmails', 'delete all mails', consoleProps, options);

		return cy.request({
			method: "DELETE",
			url: this.mailpitUrl("/v1/search"),
			qs: {
				query: query,
			},
			auth: this.auth,
			log: false
		}).its('body', { log: false})
			.then(status => this.setConsoleProps(log, {}, status));
	}

	// Single Mail Assertions
	mailpitGetSubject(message: Message, options: { log?: boolean } = { log: true }): Cypress.Chainable<string> {
		let consoleProps = { message };
		const log = this.getLog('mailpitGetSubject', 'get subject', consoleProps, options);

		return cy.wrap(message.Subject, { log: false })
			.then(subject => this.setConsoleProps(log, consoleProps, subject));
	}

	mailpitGetRecipientAddress(message: Message, options: { log?: boolean } = { log: true }): Cypress.Chainable<Array<string>> {
		let consoleProps = { message };

		const log = this.getLog('mailpitGetRecipientAddress', 'get recipient address', consoleProps, options);

		return cy.wrap(message.To.map((recipient) => recipient.Address), { log: false })
			.then(address => this.setConsoleProps(log, consoleProps, address));
	}

	mailpitGetFromAddress(message: Message, options: { log?: boolean } = { log: true }): Cypress.Chainable<string> {
		let consoleProps = { message };
		const log = this.getLog('mailpitGetFromAddress', 'get from address', consoleProps, options);

		return cy.wrap(message.From.Address, { log: false })
			.then(address => this.setConsoleProps(log, consoleProps, address));
	}

	mailpitGetAttachments(message: Message, options: { log?: boolean } = { log: true }): Cypress.Chainable<Array<string>> {
		let consoleProps = { message };
		const log = this.getLog('mailpitGetAttachments', 'get attachments', consoleProps, options);

		return cy.wrap(message.Attachments.map((attachment) => attachment.FileName), { log:false })
			.then(filename => this.setConsoleProps(log, consoleProps, filename));
	}

	mailpitGetMailSpamAssassinSummary(message: Message, options: { log?: boolean } = { log: true }): Cypress.Chainable<SpamAssassin> {
		let consoleProps = { message };
		const log = this.getLog('mailpitGetMailSpamAssassinSummary', 'get mail spam assassin summary', consoleProps, options);

		const messageId = message.ID;
		return cy
			.request({
				method: "GET",
				url: this.mailpitUrl(`/v1/message/${messageId}/sa-check`),
				auth: this.auth,
				log: false
			})
			.its('body', { log: false })
			.then(body => this.setConsoleProps(log, consoleProps, body));
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

	mailpitGetMailHTMlBody(message: Message, options: { log?: boolean } = { log: true }): Cypress.Chainable<string> {
		let consoleProps = { message };
		const log = this.getLog('mailpitGetMailSpamAssassinSummary', 'get mail spam assassin summary', consoleProps, options);

		const messageId = message.ID;
		return cy
			.request({
				method: "GET",
				url: this.mailpitUrl(`/view/${messageId}.html`, false),
				auth: this.auth,
				log: false
			})
			.its('body', { log: false })
			.then(body => this.setConsoleProps(log, consoleProps, body));
	}

	mailpitGetMailTextBody(message: Message, options: { log?: boolean } = { log: true }): Cypress.Chainable<string> {
		let consoleProps = { message };
		const log = this.getLog('mailpitGetMailTextBody', 'get mail text body', consoleProps, options);

		const messageId = message.ID;
		return cy
			.request({
				method: "GET",
				url: this.mailpitUrl(`/view/${messageId}.txt`, false),
				auth: this.auth,
				log: false
			})
			.its('body')
			.then(body => this.setConsoleProps(log, consoleProps, body));
	}

	private setReadStatus(
		messages: Message[] | Message | MessageSummary[] | MessageSummary | null,
		isRead: boolean
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
				log: false
			})
			.its('body', { log: false});
	}

	mailpitSetAllEmailStatusAsRead(options: { log?: boolean } = { log: true }): Cypress.Chainable<string> {
		let consoleProps = {};
		const log = this.getLog('mailpitSetAllEmailStatusAsRead', 'set all emails status as read', consoleProps, options);

		return this.setReadStatus(null, true)
			.then(status => this.setConsoleProps(log, consoleProps, status));
	}

	mailpitSetAllEmailStatusAsUnRead(options: { log?: boolean } = { log: true }): Cypress.Chainable<string> {
		let consoleProps = {};
		const log = this.getLog('mailpitSetAllEmailStatusAsUnRead', 'set all emails status as unread', consoleProps, options);
		
		return this.setReadStatus(null, false)
			.then(status => this.setConsoleProps(log, consoleProps, status));
	}

	mailpitSetStatusAsRead(messages: Message[] | Message | MessageSummary[] | MessageSummary, options: { log?: boolean } = { log: true }): Cypress.Chainable<string> {
		let consoleProps = { messages };
		const log = this.getLog('mailpitSetStatusAsRead', 'set status as read', consoleProps, options);

		return this.setReadStatus(messages, true)
			.then(status => this.setConsoleProps(log, consoleProps, status));
	}

	mailpitSetStatusAsUnRead(
		messages: Message[] | Message | MessageSummary[] | MessageSummary, options: { log?: boolean } = { log: true }
	): Cypress.Chainable<string> {
		let consoleProps = { messages };
		const log = this.getLog('mailpitSetStatusAsUnRead', 'set status as unread', consoleProps, options);

		return this.setReadStatus(messages, false)
			.then(status => this.setConsoleProps(log, consoleProps, status));
	}

	private waitForCondition<T>(
		fn: () => Cypress.Chainable<T>,
		condition: (result: T) => boolean,
		options: { timeout?: number; interval?: number } = {}
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
					return cy.wrap(result, {log: false});
				}
				if (Date.now() - startTime < timeout) {
					return cy.wait(interval, {log: false}).then(check);
				}

				throw new Error(`Timed out after ${timeout}ms waiting for condition`);
			});
		};

		return check();
	}

	private getLog(displayName: string, name: string,consoleProps: Cypress.ObjectLike = {}, options: { log?: boolean } = { log: true }): false | Cypress.Log {
		const log =  options.log !== false && Cypress.log({displayName, name});
		this.setConsoleProps(log,consoleProps);
		return log;
	}

	private setConsoleProps(log: false | Cypress.Log, consoleProps: Cypress.ObjectLike = {}, yieldedObject?: Cypress.ObjectLike | string): void {
		if (log) log.set({consoleProps: () => this.addYieldedObject(consoleProps, yieldedObject)});
	}

	private addYieldedObject(consoleProps: Cypress.ObjectLike = {}, yieldedObject?: Cypress.ObjectLike | string): Cypress.ObjectLike {
		return {...consoleProps, ...yieldedObject && {Yielded: yieldedObject}};
	}
}

export { MailpitCommands };
