/**
 * Represents a single email address with an optional name.
 */
interface EmailAddress {
	/** The email address, e.g., "bg@example.com". */
	Address: string;
	/** The display name associated with the email address, e.g., "Barry Gibbs". */
	Name: string;
}

export interface SendEmailAddress {
	/** The email address, e.g., "bg@example.com". */
	Email: string;
	/** The display name associated with the email address, e.g., "Barry Gibbs". */
	Name: string;
}

export interface SendEmailOptions {
	/** The list of attachments to send with the email. */
	attachments?: Array<SendAttachment>;
	/** The list of BCC email addresses. */
	bcc?: Array<string>;
	/** The list of CC email addresses. */
	cc?: Array<SendEmailAddress>;
	/** The list of email addresses to send the email to. */
	from?: SendEmailAddress;
	/** The headers of the email. */
	//biome-ignore lint: no-any
	headers?: Record<string, any>;
	/** The HTML body of the email. */
	htmlBody?: string;
	/** The list of email addresses to send the email to. */
	replyTo?: Array<SendEmailAddress>;
	/** The subject of the email. */
	subject?: string;
	/** The list of tags associated with the email. */
	tags?: Array<string>;
	/** The text body of the email. */
	textBody?: string;
	/** The list of To email addresses. */
	to?: Array<SendEmailAddress>;
}

export interface Attachment {
	/** The content of the attachment. */
	ContentID: string;
	/** The content type of the attachment. */
	ContentType: string;
	/** The file name of the attachment. */
	FileName: string;
	/** The part ID of the attachment. */
	PartID: string;
	/** The size of the attachment. */
	Size: number;
}

export interface SendAttachment {
	/** The content of the attachment. */
	Content: string;
	/** The file name of the attachment. */
	FileName: string;
}

interface MessageBase {
	/** The sender of the email. */
	From: EmailAddress;
	/** The ID of the email. */
	ID: string;
	/** The message ID of the email. */
	MessageID: string;
	/** The size of the email in bytes. */
	Size: number;
	/** The subject of the email. */
	Subject: string;
	/** The tags associated with the email. */
	Tags: string[];
	/** The list of email addresses the email was sent to. */
	To: EmailAddress[];
}

// Specific properties for Message
export interface Message extends MessageBase {
	/** The list of attachments associated with the email. */
	Attachments: Attachment[];
	/** The list of email addresses the email was BCC'd to. */
	Bcc: EmailAddress[];
	/** The list of email addresses the email was CC'd to. */
	Cc: EmailAddress[];
	/** The date the email was created or received. */
	Date: string; // Assuming Date is in ISO 8601 format
	/** The HTML body of the email. */
	HTML: string;
	/** The inline attachments of the email. */
	Inline: Attachment[];
	/** The list of email addresses to reply to. */
	ReplyTo: EmailAddress[];
	/** The Return-Path of the email. */
	ReturnPath: string;
	/** The text body of the email. */
	Text: string;
}

// Specific properties for MessageSummary
export interface MessageSummary extends MessageBase {
	/** The number of attachments associated with the email. */
	Attachments: number;
	/** The list of email addresses the email was BCC'd to. */
	Bcc: EmailAddress[];
	/** The list of email addresses the email was CC'd to. */
	Cc: EmailAddress[];
	/** The date the email was created. */
	Created: string; // Assuming Created is in ISO 8601 format
	/** Whether the email has been read. */
	Read: boolean;
	/** The list of email addresses to reply to. */
	ReplyTo: EmailAddress[];
	/** A snippet of the email body. */
	Snippet: string;
}

/**
 * Represents the summary of messages in the mailbox.
 */
export interface MessagesSummary {
	/** The list of message summaries. */
	messages: MessageSummary[];
	/** The total number of messages matching the current query. */
	messages_count: number;
	/** The pagination offset. */
	start: number;
	/** All current tags in the mailbox. */
	tags: string[];
	/** The total number of messages in the mailbox. */
	total: number;
	/** The total number of unread messages in the mailbox. */
	unread: number;
}

export interface SpamAssassin {
	/** The error message if any. */
	Error: string;
	/** If value is true, the email is considered spam. */
	IsSpam: boolean;
	/** The list of spam rules that matched. */
	Rules: Array<{
		Description: string;
		Name: string;
		Score: number;
	}>;
	/** The score of the email. */
	Score: number;
}
