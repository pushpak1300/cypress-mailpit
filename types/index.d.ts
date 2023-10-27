declare namespace Cypress {
  interface EndToEndConfigOptions {
    mailpitUrl?: string;
  }
  interface Chainable {
    mhDeleteAll(): Chainable<Cypress.Response<any>>;
    mhGetAllMails(limit?: number, options?: Partial<Timeoutable>): Chainable<mailpit.Item[]>;
    mhFirst(): Chainable<mailpit.Item>;
    mhGetMailsBySubject(subject: string, limit?: number, options?: Partial<Timeoutable>): Chainable<mailpit.Item[]>;
    mhGetMailsByRecipient(recipient: string, limit?: number, options?: Partial<Timeoutable>): Chainable<mailpit.Item[]>;
    mhGetMailsBySender(from: string, limit?: number, options?: Partial<Timeoutable>): Chainable<mailpit.Item[]>;
    mhGetSubject(): Chainable<string>;
    mhGetBody(): Chainable<string>;
    mhGetSender(): Chainable<string>;
    mhGetRecipients(): Chainable<string[]>;
    mhHasMailWithSubject(subject : string): Chainable;
    mhHasMailFrom(from : string): Chainable;
    mhHasMailTo(recipient: string): Chainable;
  }
}