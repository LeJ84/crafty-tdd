import { InMemoryMessageRepository } from '../message.inmemory.repository';
import {
  DateProvider,
  EmptyMessageError,
  Message,
  MessageRepository,
  MessageTooLongError,
  PostMessageCommand,
  PostMessageUseCase,
} from '../post-message.usecase';

describe('Feature Posting a message', () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = createFixture();
  });

  describe('Rule:A message can contain a maximum of 280 characters', () => {
    test('Alice can post a message on her timeline', () => {
      fixture.givenNowIs(new Date('2023-01-19T19:00:00.000Z'));

      fixture.whenUserPostsMessage({
        id: 'message-id',
        text: 'Hello World',
        author: 'Alice',
      });

      fixture.thenPostedMessageShouldBe({
        id: 'message-id',
        text: 'Hello World',
        author: 'Alice',
        publishedAt: new Date('2023-01-19T19:00:00.000Z'),
      });
    });

    test('Alice cannot post a message longer than 280 characters', () => {
      const tooLongMessage =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vitae tortor non urna ullamcorper finibus. Vestibulum a aliquam lacus. Suspendisse metus urna, molestie a ullamcorper at, varius vitae mauris. Sed sit amet lacinia lacus, in porta lacus. Pellentesque dapibus orci id enim.';
      fixture.givenNowIs(new Date('2023-01-19T19:00:00.000Z'));

      fixture.whenUserPostsMessage({
        id: 'message-id',
        text: tooLongMessage,
        author: 'Alice',
      });

      fixture.thenErrorShouldBe(MessageTooLongError);
    });
  });

  describe('Rule: A message cannot be empty', () => {
    test('Alice cannot post an empty message', () => {
      fixture.givenNowIs(new Date('2023-01-19T19:00:00.000Z'));

      fixture.whenUserPostsMessage({
        id: 'message-id',
        text: '',
        author: 'Alice',
      });

      fixture.thenErrorShouldBe(EmptyMessageError);
    });

    test('Alice cannot post a message with only whitespaces', () => {
      fixture.givenNowIs(new Date('2023-01-19T19:00:00.000Z'));

      fixture.whenUserPostsMessage({
        id: 'message-id',
        text: '     ',
        author: 'Alice',
      });

      fixture.thenErrorShouldBe(EmptyMessageError);
    });
  });
});

class StubDateProvider implements DateProvider {
  now: Date;
  getNow(): Date {
    return this.now;
  }
}

const createFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  );
  let thrownError: Error;
  return {
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    whenUserPostsMessage(postMessageCommand: PostMessageCommand) {
      try {
        postMessageUseCase.handle(postMessageCommand);
      } catch (error) {
        thrownError = error;
      }
    },
    thenPostedMessageShouldBe(expectedMessage: Message) {
      expect(expectedMessage).toEqual(messageRepository.message);
    },
    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
    },
  };
};

type Fixture = ReturnType<typeof createFixture>;
