import { expect, mock, test } from "bun:test";
import { Emitter, Subscribe, createEvent } from "./Event";

test("register event handlers from listener", () => {
  const TestEventA = createEvent<number>();
  const TestEventB = createEvent<string>();
  const TestEventC = createEvent<boolean>();

  const fnA = mock((data: number) => data);
  const fnB = mock((data: string) => data);
  const fnC = mock((data: boolean) => data);

  class Listener {
    @Subscribe(TestEventA)
    onTestEventA(data: number) {
      fnA(data);
    }

    @Subscribe(TestEventB)
    onTestEventB(data: string) {
      fnB(data);
    }

    @Subscribe(TestEventC)
    onTestEventC(data: boolean) {
      fnC(data);
    }
  }

  const emitter = new Emitter();
  const listener = new Listener();
  emitter.addListener(listener);

  emitter.call(TestEventA, 5);
  expect(fnA.mock.calls).toEqual([[5]]);

  emitter.call(TestEventB, "test");
  expect(fnB.mock.calls).toEqual([["test"]]);

  emitter.call(TestEventC, true);
  expect(fnC.mock.calls).toEqual([[true]]);
});

test("add multiple listeners at the same time", () => {
  const TestEvent = createEvent();
  const testFn = mock(() => undefined);

  class Listener {
    @Subscribe(TestEvent)
    onTestEvent() {
      testFn();
    }
  }

  const emitter = new Emitter();
  emitter.addListeners(new Listener(), new Listener(), new Listener());

  emitter.call(TestEvent);

  expect(testFn.mock.calls.length).toEqual(3);
});

test("ignore removed event handlers and listeners", () => {
  const TestEvent = createEvent<number>();

  const fnA = mock(() => undefined);
  const fnB = mock(() => undefined);
  const fnC = mock(() => undefined);
  const fnD = mock(() => undefined);

  class Listener {
    @Subscribe(TestEvent)
    testFnA() {
      fnA();
    }

    @Subscribe(TestEvent)
    testFnB() {
      fnB();
    }
  }

  const listener = new Listener();
  const emitter = new Emitter();

  emitter.addListener(listener);
  emitter.addHandler(TestEvent, { method: fnC, priority: 0 });
  emitter.addHandler(TestEvent, { method: fnD, priority: 0 });

  emitter.removeListener(listener);
  expect(emitter.removeMethod(TestEvent, fnC)).toBeTrue();
  expect(emitter.removeMethod(TestEvent, fnC)).toBeFalse();

  emitter.call(TestEvent, 39);

  expect(fnA.mock.calls).toStrictEqual([]);
  expect(fnB.mock.calls).toStrictEqual([]);
  expect(fnC.mock.calls).toStrictEqual([]);
  expect(fnD.mock.calls).toStrictEqual([[39]] as any);
});

test("call event handlers in priority", () => {
  const TestEvent = createEvent();
  const arr: string[] = [];

  const fnA = mock(() => arr.push("A"));
  const fnB = mock(() => arr.push("B"));
  const fnC = mock(() => arr.push("C"));

  class Listener {
    @Subscribe(TestEvent, -10)
    testFnA() {
      fnA();
    }

    @Subscribe(TestEvent, 10)
    testFnB() {
      fnB();
    }

    @Subscribe(TestEvent, 0)
    testFnC() {
      fnC();
    }
  }

  const emitter = new Emitter();
  const listener = new Listener();
  emitter.addListener(listener);
  emitter.call(TestEvent);

  expect(arr).toEqual(["B", "C", "A"]);
});
