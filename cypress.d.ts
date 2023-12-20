/// <reference types="cypress" />
declare namespace Cypress {
  interface EndToEndConfigOptions {
    mailpitUrl?: string;
  }
  interface Chainable {
    mhDeleteAll(): void;
    mhGetAllMails(limit?: number, options?: RequestOptions): Chainable<Array<Message>>;
    mhFirst(): Chainable<Message>;
    mhGetMailsBySubject(subject: string, limit?: number, options?: RequestOptions): Chainable<Array<Message>>;
    mhGetMailsByRecipient(recipient: string, limit?: number, options?: RequestOptions): Chainable<Array<Message>>;
    mhGetMailsBySender(from: string, limit?: number, options?: RequestOptions): Chainable<Array<Message>>;
    mhGetSubject(): Chainable<string>;
    mhGetBodyHTML(): Chainable<string>;
    mhGetBody(): Chainable<string>;
    mhGetSender(): Chainable<string>;
    mhGetRecipients(): Chainable<Array<string>>;
    mhHasMailWithSubject(subject: string): Chainable<any[]>;
    mhHasMailFrom(from: string): Chainable<any[]>;
    mhHasMailTo(to: string): Chainable<any[]>;
  }
}
