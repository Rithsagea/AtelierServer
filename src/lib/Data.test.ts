import { expect, test } from "bun:test";
import {
  InitializeObjectEvent,
  Property,
  Register,
  TypeMap,
  deserialize,
  serialize,
  type Serializer,
} from "./Data";
import { applyMixins, type Constructor } from "./Util";
import { Subscribe } from "./Event";

export function testSerialization<T extends NonNullable<unknown>>(
  obj: T,
  data: any,
  ctor: Constructor<T>,
) {
  const ser = serialize(obj);
  expect(data).toEqual(ser);

  const res = deserialize(ser, ctor);
  expect(obj).toEqual(res);
}

class TestClass {
  @Property
  foo: number = 0;
  bar: number = 0;

  @Subscribe(InitializeObjectEvent)
  init() {
    this.bar = this.foo + 3;
  }
}

class TestWrapper {
  @Property(TestClass)
  data?: TestClass;
  foo?: number;
  bar?: number;

  @Subscribe(InitializeObjectEvent)
  init() {
    this.foo = this.data?.foo;
    this.bar = this.data?.bar;
  }
}

test("serializes objects from class", () => {
  const testObj = new TestClass();
  testObj.foo = 5;
  testObj.init();

  const data = { foo: 5 };

  testSerialization(testObj, data, TestClass);
});

test("serialize nested objects", () => {
  const testObj = new TestClass();
  testObj.foo = 5;
  testObj.init();

  const testWrapper = new TestWrapper();
  testWrapper.data = testObj;
  testWrapper.init();

  const data = { data: { foo: 5 } };
  testSerialization(testWrapper, data, TestWrapper);
});

test("register subclasses", () => {
  type Subclass = object;
  const Subclasses = new TypeMap<Subclass>();

  @Register(Subclasses)
  class Subclass1 implements Subclass {}
  @Register(Subclasses)
  class Subclass2 implements Subclass {}
  @Register(Subclasses)
  class Subclass3 implements Subclass {}

  expect(Subclasses).toEqual(new TypeMap(Subclass1, Subclass2, Subclass3));
});

test("serialize subclasses", () => {
  type Subclass = object;
  const Subclasses = new TypeMap<Subclass>();

  class TestSubclassWrapper {
    @Property(Subclasses)
    objs: Subclass[] = [];
  }

  @Register(Subclasses)
  class TestSubclass1 {
    @Property
    foo?: number;
  }

  @Register(Subclasses)
  class TestSubclass2 {
    @Property
    bar?: string;
  }

  @Register(Subclasses)
  class TestSubclass3 {
    @Property
    baz?: object;
  }

  const obj = new TestSubclassWrapper();
  let newSubclass;

  newSubclass = new TestSubclass1();
  newSubclass.foo = 5;
  obj.objs.push(newSubclass);

  newSubclass = new TestSubclass2();
  newSubclass.bar = "test";
  obj.objs.push(newSubclass);

  newSubclass = new TestSubclass3();
  newSubclass.baz = {
    asdf: "asdf",
  };
  obj.objs.push(newSubclass);

  {
    @Register(Subclasses)
    class TestSubclass1 {
      @Property
      fizz?: "buzz";
    }

    newSubclass = new TestSubclass1();
    newSubclass.fizz = "buzz";
    obj.objs.push(newSubclass);
  }

  const expected = {
    objs: [
      {
        $id: "TestSubclass1@1",
        foo: 5,
      },
      {
        $id: "TestSubclass2",
        bar: "test",
      },
      {
        $id: "TestSubclass3",
        baz: { asdf: "asdf" },
      },
      {
        $id: "TestSubclass1@2",
        fizz: "buzz",
      },
    ],
  };

  testSerialization(obj, expected, TestSubclassWrapper);
});

test("custom serializer", () => {
  const TestSerializer: Serializer<number> = {
    serialize: (obj) => ({ value: obj }),
    deserialize: (obj) => obj.value,
  };

  class TestClass {
    @Property(TestSerializer)
    field?: number;
  }

  const obj = new TestClass();
  obj.field = 39;

  testSerialization(obj, { field: { value: 39 } }, TestClass);
});

test("serialize traits", () => {
  interface TestTrait1 {
    getTraitValue(): number;
    setTraitValue(value: number): void;
  }

  interface TestTrait2 {
    getString(): string;
    setString(value: string): void;
  }

  class TestImpl1 implements TestTrait1 {
    @Property
    traitValue: number = 0;

    getTraitValue() {
      return this.traitValue;
    }

    setTraitValue(value: number) {
      this.traitValue = value;
    }
  }

  interface TestClass extends TestTrait1, TestTrait2 {}
  class TestClass implements TestTrait1, TestTrait2 {
    @Property
    classValue: string = "";

    getString() {
      return this.classValue;
    }

    setString(value: string) {
      this.classValue = value;
    }

    getInheritedTraitValue() {
      return this.getTraitValue();
    }
  }
  applyMixins(TestClass, [TestImpl1]);

  const obj = new TestClass();
  obj.setTraitValue(39);
  obj.setString("miku");

  expect(obj.getInheritedTraitValue()).toEqual(39);
  testSerialization(obj, { traitValue: 39, classValue: "miku" }, TestClass);
});
