describe("mailpit sending test", () => {
	beforeEach(() => {
		cy.mailpitDeleteAllEmails();
	});

	afterEach(() => {
		cy.mailpitDeleteAllEmails();
	});

	it("can send one email", () => {
		cy.mailpitSendMail().then((result) => {
			console.log(result)
			expect(result).to.have.property("ID");
			expect(result.ID).match(/\w+/);
		});
		cy.mailpitGetAllMails().then((result) => {
			expect(result).to.have.property("messages_count", 1);
		});
	});

	it("mailpitSendMail can assert invalid to address", () => {
		cy.on('fail', err => {
			expect(err.message).to.contain('400: Bad Request')
			expect(err.message).to.contain('invalid To address')
		});
		cy.mailpitSendMail({ to: [{ Email: "", Name: "To" }] });
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
		cy
			.mailpitGetMail()
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

	it("can get all the emails by to", () => {
		const numberOfEmails = 5;
		for (let i = 1; i <= numberOfEmails; i++) {
			cy.mailpitSendMail({
				to: [{ Email: "test@example.com", Name: "To" }],
			});
		}
		for (let i = 1; i <= numberOfEmails; i++) {
			cy.mailpitSendMail();
		}
		cy.mailpitGetEmailsByTo("test@example.com").then((result) => {
			expect(result).to.have.property("messages_count", numberOfEmails);
			expect(result).to.have.property("total", 2 * numberOfEmails);
			expect(result).to.have.property("count", numberOfEmails);
			expect(result).to.have.property("messages");
			expect(result.messages).to.have.length(numberOfEmails);
			expect(result.messages).to.be.an("array");
		});
	});

	it("can assert mailpit has emails by search query", () => {
		cy.mailpitSendMail({
			subject: "Searchable Subject",
			textBody: "This is a test email for searching.",
		});
		cy.mailpitHasEmailsBySearch("subject:Searchable Subject");
		cy.mailpitNotHasEmailsBySearch("subject:Nonexistent");
	});

	it("can assert timeout mailpitHasEmailsBySearch", () => {
		const startTime = Date.now();
		cy.on('fail', (error) => {
			const finishedTime = Date.now();
			expect(finishedTime - startTime, 'Testing exception is thrown after around 1000 ms').to.be.closeTo(1000, 200);
			expect(error.message).to.include('Timed out after 1000ms waiting for condition');
		});
		cy.mailpitHasEmailsBySearch("invalid@example.com", undefined, undefined, { timeout: 1000, interval: 100 });
	});

	it("can assert timeout mailpitNotHasEmailsBySearch", () => {
		cy.mailpitSendMail({
			subject: "Searchable Subject",
			textBody: "This is a test email for searching.",
		});
		const startTime = Date.now();
		cy.on('fail', (error) => {
			const finishedTime = Date.now();
			expect(finishedTime - startTime, 'Testing exception is thrown after around 1000 ms').to.be.closeTo(1000, 200);
			expect(error.message).to.include('Timed out after 1000ms waiting for condition');
		});
		cy.mailpitNotHasEmailsBySearch("subject:Searchable Subject", undefined, undefined, { timeout: 1000, interval: 100 });
	});

	it("can assert mailpit has emails by subject or not", () => {
		cy.mailpitSendMail({
			subject: "My Test",
		});
		cy.mailpitHasEmailsBySubject("My Test");
		cy.mailpitNotHasEmailsBySubject("Not");
	});

	it("can assert timeout mailpitHasEmailsBySubject", () => {
		const startTime = Date.now();
		cy.on('fail', (error) => {
			const finishedTime = Date.now();
			expect(finishedTime - startTime, 'Testing exception is thrown after around 1000 ms').to.be.closeTo(1000, 200);
			expect(error.message).to.include('Timed out after 1000ms waiting for condition');
		});
		cy.mailpitHasEmailsBySubject("invalid@example.com", undefined, undefined, { timeout: 1000, interval: 100 });
	});

	it("can assert timeout mailpitNotHasEmailsBySubject", () => {
		cy.mailpitSendMail({subject: "My Test"});
		const startTime = Date.now();
		cy.on('fail', (error) => {
			const finishedTime = Date.now();
			expect(finishedTime - startTime, 'Testing exception is thrown after around 1000 ms').to.be.closeTo(1000, 200);
			expect(error.message).to.include('Timed out after 1000ms waiting for condition');
		});
		cy.mailpitNotHasEmailsBySubject("My Test", undefined, undefined, { timeout: 1000, interval: 100 });
	});

	it("can assert mailpit has emails by to or not", () => {
		cy.mailpitSendMail({
			to: [{ Email: "to@example.com", Name: "To" }],
		});
		cy.mailpitHasEmailsByTo("to@example.com");
		cy.mailpitNotHasEmailsByTo("invalid@example.com");
	});

	it("can assert timeout mailpitHasEmailsByTo", () => {
		const startTime = Date.now();
		cy.on('fail', (error) => {
			const finishedTime = Date.now();
			expect(finishedTime - startTime, 'Testing exception is thrown after around 1000 ms').to.be.closeTo(1000, 200);
			expect(error.message).to.include('Timed out after 1000ms waiting for condition');
		});
		cy.mailpitHasEmailsByTo("invalid@example.com", undefined, undefined, { timeout: 1000, interval: 100 });
	});

	it("can assert timeout mailpitNotHasEmailsByTo", () => {
		cy.mailpitSendMail({to: [{ Email: "to@example.com", Name: "To" }]});
		const startTime = Date.now();
		cy.on('fail', (error) => {
			const finishedTime = Date.now();
			expect(finishedTime - startTime, 'Testing exception is thrown after around 1000 ms').to.be.closeTo(1000, 200);
			expect(error.message).to.include('Timed out after 1000ms waiting for condition');
		});
		cy.mailpitNotHasEmailsByTo("to@example.com", undefined, undefined, { timeout: 1000, interval: 100 });
	});
});



describe("mailpit read status test", () => {
	beforeEach(() => {
		cy.mailpitDeleteAllEmails();
	});

	afterEach(() => {
		cy.mailpitDeleteAllEmails();
	});

	it("can set email status as read", () => {
		cy.mailpitSendMail();
		cy.mailpitSendMail({
			htmlBody: "<p>Test</p>",
			textBody: "Test",
		});
		cy.mailpitSearchEmails("Test").then((result) => {
			expect(result.messages[0].Read).to.false;
		});

		cy.mailpitGetMail().mailpitSetStatusAsRead();

		cy.mailpitSearchEmails("Test").then((result) => {
			expect(result.messages[0].Read).to.true;
		});
	});

	it("can set email status as unread", () => {
		cy.mailpitSendMail();
		cy.mailpitSendMail({
			htmlBody: "<p>Test</p>",
			textBody: "Test",
		});
		cy.mailpitGetMail().mailpitSetStatusAsRead();
		cy.mailpitSearchEmails("Test").then((result) => {
			expect(result.messages[0].Read).to.true;
		});
		cy.mailpitGetMail().mailpitSetStatusAsUnRead();
		cy.mailpitSearchEmails("Test").then((result) => {
			expect(result.messages[0].Read).to.false;
		});
	});

	it("can set multiple email statuses", () => {
		const EmailsToSend = 3;
		for (let index = 0; index < EmailsToSend; index++) {
			cy.mailpitSendMail({ subject: `Test ${index}` });
		}

		// Verify all emails are now read
		for (let index = 0; index < EmailsToSend; index++) {
			cy.mailpitSearchEmails(`Test ${index}`).then((result) => {
				expect(result.messages[0].Read).to.false;
			});
		}

		cy.mailpitSetAllEmailStatusAsRead();

		// Verify all emails are now read
		for (let index = 0; index < EmailsToSend; index++) {
			cy.mailpitSearchEmails(`Test ${index}`).then((result) => {
				expect(result.messages[0].Read).to.true;
			});
		}

		// Set all emails as unread
		cy.mailpitSetAllEmailStatusAsUnRead();

		// Verify all emails are now unread
		for (let index = 0; index < EmailsToSend; index++) {
			cy.mailpitSearchEmails(`Test ${index}`).then((result) => {
				expect(result.messages[0].Read).to.false;
			});
		}
	});
});

describe("mailpit delete test", () => {
	beforeEach(() => {
		cy.mailpitDeleteAllEmails();
	});

	afterEach(() => {
		cy.mailpitDeleteAllEmails();
	});

	it("should delete emails by search query", () => {
		cy.mailpitSendMail({
			subject: "Delete Me",
			textBody: "Test",
		});
		cy.mailpitSendMail({
			subject: "No Delete",
			textBody: "Test",
		});

		cy.mailpitDeleteEmailsBySearch("subject:Delete Me");

		cy.mailpitHasEmailsBySubject("No Delete");
		cy.mailpitNotHasEmailsBySubject("Delete Me");
	});

	it("mailpitDeleteEmailsBySearchcan assert no search query", () => {
		cy.on('fail', err => {
			expect(err.message).to.contain('400: Bad Request')
			expect(err.message).to.contain('no search query')
		});
		cy.mailpitDeleteEmailsBySearch("");
	});
});
