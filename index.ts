/// <reference types="cypress" />
import { MailpitCommands } from "./src/MailpitCommands";

const mailpitCommand = new MailpitCommands();

const addCommands = (commands: Array<string>, options = {}) => {
	for (const commandName of commands) {
		// @ts-expect-error dynamic command registration
		Cypress.Commands.add(commandName, options, mailpitCommand[commandName].bind(mailpitCommand));
	}
};

addCommands(MailpitCommands.parentCypressCommands);
addCommands(MailpitCommands.childCypressCommands, { prevSubject: true });
