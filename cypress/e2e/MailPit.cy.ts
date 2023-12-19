const simulatedTransportDelay = 2000;

describe("Mailpit Test", () => {
  beforeEach(() => {
    cy.mhDeleteAll();
  });
  afterEach(() => {
    cy.mhDeleteAll();
  });

  it("can check the simple email", () => {
    cy.task("sendEmail", {
      from: "from@example.com",
      to: "to@example.com",
      bcc: "bcc@example.com",
      cc: "cc@example.com",
      subject: "Hello",
      body: "test",
    });
    cy.wait(simulatedTransportDelay);
    cy.mhHasMailWithSubject("Hello");
  });

  it("can check the multiple emails", () => {
    const numberOfEmails = 10;
    for (let i = 0; i < numberOfEmails; i++) {
      cy.task("sendEmail", {
        from: "from@example.com",
        to: "to@example.com",
        bcc: "bcc@example.com",
        cc: "cc@example.com",
        subject: "Hello",
        body: "test",
      });
    }
    cy.wait(simulatedTransportDelay);
    cy.mhGetAllMails().should("have.length", numberOfEmails);
  });

  it("can get the email with subject from multiple emails", () => {
    const numberOfEmails = 10;
    for (let i = 0; i < numberOfEmails; i++) {
      cy.task("sendEmail", {
        from: `from@example.com`,
        to: "to@example.com",
        bcc: "bcc@example.com",
        cc: "cc@example.com",
        subject: `Hello ${i}`,
        body: "test",
      });
    }
    cy.wait(simulatedTransportDelay);
    cy.mhGetMailsBySubject('Hello 5').should("have.length", 1);
  });

  it("can get the email with sender from multiple emails senders", () => {
    const numberOfEmails = 10;
    for (let i = 0; i < numberOfEmails; i++) {
      cy.task("sendEmail", {
        from: `from${i}@example.com`,
        to: "to@example.com",
        bcc: "bcc@example.com",
        cc: "cc@example.com",
        subject: `Hello ${i}`,
        body: "test",
      });
    }
    cy.wait(simulatedTransportDelay);
    cy.mhGetMailsBySender('from5@example.com').should("have.length", 1);
  });

  it("can get the email with sender from multiple emails", () => {
    const numberOfEmails = 10;
    for (let i = 0; i < numberOfEmails; i++) {
      cy.task("sendEmail", {
        from: `from${i}@example.com`,
        to: "to@example.com",
        bcc: "bcc@example.com",
        cc: "cc@example.com",
        subject: `Hello ${i}`,
        body: "test",
      });
    }
    for (let i = 0; i < numberOfEmails; i++) {
      cy.task("sendEmail", {
        from: `from@example.com`,
        to: "to@example.com",
        bcc: "bcc@example.com",
        cc: "cc@example.com",
        subject: `Hello ${i}`,
        body: "test",
      });
    }
    cy.wait(simulatedTransportDelay);
    cy.mhGetMailsBySender('from@example.com').should("have.length", numberOfEmails);
  });

  it("can get the email with recipient from multiple recipients", () => {
    const numberOfEmails = 10;
    for (let i = 0; i < numberOfEmails; i++) {
      cy.task("sendEmail", {
        from: `from${i}@example.com`,
        to: `to${i}@example.com`,
        bcc: "bcc@example.com",
        cc: "cc@example.com",
        subject: `Hello ${i}`,
        body: "test",
      });
    }
    for (let i = 0; i < numberOfEmails; i++) {
      cy.task("sendEmail", {
        from: `from@example.com`,
        to: "to@example.com",
        bcc: "bcc@example.com",
        cc: "cc@example.com",
        subject: `Hello`,
        body: "test",
      });
    }
    cy.wait(simulatedTransportDelay);
    const recipient = cy.mhGetMailsByRecipient('to5@example.com').should("have.length", 1)
    .mhFirst()
    .mhGetRecipients().should('be.an', 'array').should('contain', 'to5@example.com');
    console.log(recipient);
    cy.mhGetMailsByRecipient('to@example.com').should("have.length", numberOfEmails)
  });

  it("can delete all the emails", () => {
    cy.mhGetAllMails().should("have.length", 0);
    const numberOfEmails = 10;
    for (let i = 0; i < numberOfEmails; i++) {
      cy.task("sendEmail", {
        from: `from${i}@example.com`,
        to: `to${i}@example.com`,
        bcc: "bcc@example.com",
        cc: "cc@example.com",
        subject: `Hello ${i}`,
        body: "test",
      });
    }
    cy.wait(simulatedTransportDelay);
    cy.mhGetAllMails().should("have.length", numberOfEmails);
    cy.mhDeleteAll();
    cy.mhGetAllMails().should("have.length", 0);
  });

  it("returns the mail subject", () => {
    cy.task("sendEmail", {
      from: `from@example.com`,
      to: `to$@example.com`,
      bcc: "bcc@example.com",
      cc: "cc@example.com",
      subject: 'Hello',
      body: "test",
    });
    cy.wait(simulatedTransportDelay);
    cy.mhGetAllMails().should('have.length', 1).mhFirst().mhGetSubject().should('eq', 'Hello');
  });

  it("returns the mail body", () => {
    cy.task("sendEmail", {
      from: `from@example.com`,
      to: `to$@example.com`,
      bcc: "bcc@example.com",
      cc: "cc@example.com",
      subject: 'Hello',
      htmlBody: "<h1>Hello</h1> <p>World</p>",
    });
    cy.wait(simulatedTransportDelay);
    cy.mhGetAllMails().should('have.length', 1).mhFirst().mhGetBody().should('contain', '<h1>Hello</h1>');
  });

  it("returns the mail sender", () => {
    cy.task("sendEmail", {
      from: `from@example.com`,
      to: `to$@example.com`,
      bcc: "bcc@example.com",
      cc: "cc@example.com",
      subject: 'Hello',
      htmlBody: "<h1>Hello</h1> <p>World</p>",
    });
    cy.wait(simulatedTransportDelay);
    cy.mhGetAllMails().should('have.length', 1).mhFirst().mhGetSender().should('equal', 'from@example.com');
  });
});
