import type { Message, MessagesSummary, SendEmailOptions, SpamAssassin } from "./types";

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

	mailpitHasEmailsBySubject(subject: string, start = 0, limit = 50): Cypress.Chainable {
		return this.mailpitGetEmailsBySubject(subject, start, limit)
			.should("have.property", "messages_count")
			.should("be.gt", 0);
	}

	mailpitNotHasEmailsBySubject(subject: string, start = 0, limit = 50): Cypress.Chainable {
		return this.mailpitGetEmailsBySubject(subject, start, limit)
			.should("have.property", "messages_count")
			.should("equal", 0);
	}

	mailpitGetEmailsByTo(email: string, start = 0, limit = 50): Cypress.Chainable<MessagesSummary> {
		return this.mailpitSearchEmails(`to:${email}`, start, limit);
	}

	mailpitHasEmailsByTo(email: string, start = 0, limit = 50): Cypress.Chainable {
		return this.mailpitGetEmailsByTo(email, start, limit).should("have.property", "messages_count").should("be.gt", 0);
	}

	mailpitNotHasEmailsByTo(email: string, start = 0, limit = 50): Cypress.Chainable {
		return this.mailpitGetEmailsByTo(email, start, limit).should("have.property", "messages_count").should("equal", 0);
	}

	mailpitDeleteAllEmails(): Cypress.Chainable<Cypress.Response<void>> {
		return cy.request({ method: "DELETE", url: this.mailpitUrl("/v1/messages"), auth: this.auth });
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
}

export { MailpitCommands };
