describe("mailpit sending test", () => {
	beforeEach(() => {
		cy.mailpitDeleteAllEmails();
	});

	afterEach(() => {
		cy.mailpitDeleteAllEmails();
	});

	it("can send one email", () => {
		cy.mailpitSendMail().then((result) => {
			expect(result).to.have.property("ID");
		});
		cy.mailpitGetAllMails().then((result) => {
			expect(result).to.have.property("messages_count", 1);
		});
	});

	it("can send multiple emails", () => {
		const numberOfEmails = 10;
		for (let i = 1; i <= numberOfEmails; i++) {
			cy.mailpitSendMail({
				to: [{ Email: `to${i}@example.com`, Name: `To${i}` }],
			});
		}
		// assert the number of emails
		cy.mailpitGetAllMails().then((result) => {
			expect(result).to.have.property("messages_count", numberOfEmails);
		});
	});
});

describe("mailpit query test", () => {
	beforeEach(() => {
		cy.mailpitDeleteAllEmails();
	});
	afterEach(() => {
		cy.mailpitDeleteAllEmails();
	});

	it("can check the multiple emails", () => {
		const numberOfEmails = 10;
		for (let i = 0; i < numberOfEmails; i++) {
			cy.mailpitSendMail();
		}
		cy.mailpitGetAllMails().then((result) => {
			expect(result).to.have.property("messages");
			expect(result.messages).to.have.length(numberOfEmails);
			expect(result.messages).to.be.an("array");
			expect(result).to.have.property("tags");
			expect(result).to.have.property("messages_count", numberOfEmails);
			expect(result).to.have.property("start");
			expect(result).to.have.property("total", numberOfEmails);
			expect(result).to.have.property("count", numberOfEmails);
			expect(result).to.have.property("unread");
		});
	});

	it("can get the latest email", () => {
		cy.mailpitSendMail();
		cy.mailpitGetMail().then((result) => {
			expect(result).to.have.property("ID");
			expect(result).to.have.property("MessageID");
			expect(result).to.have.property("From");
			expect(result).to.have.property("To");
			expect(result).to.have.property("Subject");
		});
	});

	it("can perform assertion on the latest email", () => {
		cy.mailpitSendMail({
			to: [
				{ Email: "to@example.com", Name: "To" },
				{ Email: "text@example.com", Name: "To" },
			],
			subject: "Test",
			textBody: "Test",
			htmlBody: "<p>Test</p>",
		});
		cy.mailpitGetMail().mailpitGetSubject().should("eq", "Test");
		cy.mailpitGetMail().mailpitGetRecipientAddress().should("contain", "to@example.com");
		cy.mailpitGetMail().mailpitGetMailHTMlBody().should("contain", "<p>Test</p>");
		cy.mailpitGetMail().mailpitGetMailTextBody().should("eq", "Test");
	});

	it("can get attachment on the latest email", () => {
		cy.mailpitSendMail({
			attachments: [
				{ Content: "SGVsbG8gV29ybGQ=", FileName: "hello.txt" },
				{ Content: "SGVsbG8gV29ybGQ=", FileName: "hello2.txt" },
			],
			to: [
				{ Email: "to@example.com", Name: "To" },
				{ Email: "text@example.com", Name: "To" },
			],
			subject: "Test",
			textBody: "Test",
			htmlBody: "<p>Test</p>",
		});
		cy.mailpitGetMail()
			.mailpitGetAttachments()
			.should("length", 2)
			.should("contain", "hello2.txt")
			.should("contain", "hello.txt");
	});

	it("can search the latest email by query", () => {
		const numberOfEmails = 1;
		cy.mailpitSendMail();
		cy.mailpitSendMail();
		cy.mailpitSendMail({
			htmlBody: "<p>Test</p>",
			textBody: "Test",
		});
		cy.mailpitSearchEmails("Test").then((result) => {
			expect(result).to.have.property("messages");
			expect(result.messages).to.have.length(numberOfEmails);
			expect(result.messages).to.be.an("array");
			expect(result.messages[0].Snippet).to.contain("Test");
			expect(result.messages).to.have.length(numberOfEmails);
			expect(result.messages).to.be.an("array");
			expect(result).to.have.property("messages_count", numberOfEmails);
			expect(result).to.have.property("total", 3);
			expect(result).to.have.property("count", numberOfEmails);
		});
	});

	it("can get all the emails by subject", () => {
		const numberOfEmails = 5;
		for (let i = 1; i <= numberOfEmails; i++) {
			cy.mailpitSendMail({
				subject: "My Test",
			});
		}
		for (let i = 1; i <= numberOfEmails; i++) {
			cy.mailpitSendMail();
		}
		cy.mailpitGetEmailsBySubject("My Test").then((result) => {
			expect(result).to.have.property("messages");
			expect(result.messages).to.have.length(numberOfEmails);
			expect(result.messages).to.be.an("array");
			expect(result).to.have.property("messages_count", numberOfEmails);
			expect(result).to.have.property("total", 2 * numberOfEmails);
			expect(result).to.have.property("count", numberOfEmails);
		});
	});
});
