export type Message = {
  id: string;
  text: string;
  author: string;
  publishedAt: Date;
};

export class PostMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider
  ) {}
  handle(postMessageCommand: PostMessageCommand) {
    if (postMessageCommand.text.length > 280) throw new MessageTooLongError();
    if (!postMessageCommand.text.trim()) throw new EmptyMessageError();

    this.messageRepository.save({
      id: postMessageCommand.id,
      text: postMessageCommand.text,
      author: postMessageCommand.author,
      publishedAt: this.dateProvider.getNow(),
    });
  }
}

export class MessageTooLongError extends Error {}
export class EmptyMessageError extends Error {}

export interface MessageRepository {
  save(message: Message): void;
}

export interface DateProvider {
  getNow(): Date;
}

export type PostMessageCommand = {
  id: string;
  text: string;
  author: string;
};
