// FIRST CLASS DECORATORS

function Logger(constructor: Function) {
  console.log("Decorator  Logging...");
  console.log(constructor);
}

@Logger
class Person {
  name = "Max";

  constructor() {
    console.log("creating person object...");
  }
}

const pers = new Person();

console.log(pers);

// CREATING A DECORATOR FACTORY
function LoggerF(logstring: string) {
  return function (constructor: Function) {
    console.log(logstring);
    console.log(constructor);
  };
}

@LoggerF("LOGGING - PERSON")
class PersonF {
  name = "Max";

  constructor() {
    console.log("creating person object...");
  }
}

function WithTemplate(template: string, hookId: string) {
  return function (_: Function) {
    const hookEL = document.getElementById(hookId)!;

    if (hookEL) {
      hookEL.innerHTML = template;
    }
  };
}
// -- NOTE: The underscore tells typescript
//that though I have to specify this argument.
// I reaaly don't need it.
@WithTemplate(`<h1>My Person Object</h1>`, "app")
class PersonT {
  name = "Max";

  constructor() {
    console.log("creating person object...");
  }
}

function WithTemplateA(template: string, hookId: string) {
  return function (constructor: any) {
    const hookEL = document.getElementById(hookId);
    const p = new constructor();

    if (hookEL) {
      hookEL.innerHTML = template;
      hookEL.querySelector("h1")!.textContent = p.name;
    }
  };
}

@Logger
@WithTemplateA(`<h1>My Person Object</h1>`, "app")
class PersonA {
  name = "Max";

  constructor() {
    console.log("creating person object...");
  }
}

// -- NOTE: When there are more than one decorator
// -- execution happens bottom up

// -- Also note the decorators factory execute
//top to bottom to follow normal javascript rules

// -- Please Note: The actual decorator is the inner faction that is returned by the decorator factory

// function Log(target: any, propertyName: string | symbol) {}

//  PROPERTY DECORATOR
function Log(target: any, propertyName: string | symbol) {
  console.log("property decorator");
  console.log(`target: `, target);
  console.log(`property Name: `, propertyName);
}

// --targegt is referring to the constructor function wether static or instance type
// -- name is referring to the assesor name
// -- descriptor is referring to the property name

// ASSESSOR DECORATOR
function Log2(target: any, name: string, descriptor: PropertyDescriptor) {
  console.log("Accessor Decorator");
  console.log(target);
  console.log(name);
  console.log(descriptor);
}

// METHOD DECORATOR
function Log3(
  target: any,
  name: string | symbol,
  descriptor: PropertyDescriptor
) {
  console.log("Method Decorator");
  console.log(target);
  console.log(name);
  console.log(descriptor);
}

// PARAMETER DECORATOR
function Log4(target: any, name: string | symbol, position: number) {
  console.log("Parameter Decorator");
  console.log(target);
  console.log(name);
  console.log(position);
}

class Product {
  @Log
  title: string;
  private _price: number;

  get price() {
    return this._price;
  }
  @Log2
  set price(value: number) {
    if (value > 0) {
      this._price = value;
    } else {
      throw new Error("Invalid price - should be positive");
    }
  }
  constructor(title: string, price: number) {
    this.title = title;
    this._price = price;
  }
  @Log3
  getPriceWithTax(@Log4 tax: number) {
    return this._price * (1 + tax);
  }
}

// DECORATORS THAT RETURN SOMETHING

// Decorator that returns a class
function WithTemplateR(template: string, hookId: string) {
  console.log("TEMPLATE FACTORY");
  return function <T extends { new (...args: any[]): { name: string } }>(
    originalConstructor: T
  ) {
    return class extends originalConstructor {
      constructor(..._: any[]) {
        super();
        console.log("Rendering template");
        const hookEl = document.getElementById(hookId);
        if (hookEl) {
          hookEl.innerHTML = template;
          hookEl.querySelector("h1")!.textContent = this.name;
        }
      }
    };
  };
}

// -- NOTE: The underscore tells typescript
//that though I have to specify this argument.
// I reaaly don't need it.
@WithTemplateR(`<h1>My Person Object</h1>`, "app")
class PersonR {
  name = "Max";

  constructor() {
    console.log("creating person object...");
  }
}

const perso = new Person();
console.log(perso);

// CREATING AN AUTOBIND EVENT

function AutoBind(_: any, _2: string | symbol, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  console.log("descriptor    ", descriptor);
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjustedDescriptor;
}

class Printer {
  message = "This Works!";

  @AutoBind
  showMessage() {
    console.log(this.message);
  }
}

const p = new Printer();
const button = document.querySelector("button")!;

// Work around to ensure the this keyword is referrinfg to the p object
// and not the event in the addEventListener
// button.addEventListener("click", p.showMessage.bind(p));

button.addEventListener("click", p.showMessage);

// VALIDATION WITH DECORATORS

interface ValidatorConfig {
  [property: string]: {
    [validatableProp: string]: string[]; // ['required', 'positive']
  };
}

const registeredValidators: ValidatorConfig = {};

function Required(target: any, propName: string) {
  registeredValidators[target.constructor.name] = {
    ...registeredValidators[target.constructor.name],
    [propName]: ["required"],
  };
}

function PositiveNumber(target: any, propName: string) {
  registeredValidators[target.constructor.name] = {
    ...registeredValidators[target.constructor.name],
    [propName]: ["positive"],
  };
}

function validate(obj: any) {
  const objValidatorConfig = registeredValidators[obj.constructor.name];
  if (!objValidatorConfig) {
    return true;
  }
  let isValid = true;
  for (const prop in objValidatorConfig) {
    for (const validator of objValidatorConfig[prop]) {
      switch (validator) {
        case "required":
          isValid = isValid && !!obj[prop];
          break;
        case "positive":
          isValid = isValid && obj[prop] > 0;
          break;
      }
    }
  }
  return isValid;
}

class Course {
  @Required
  title: string;
  @PositiveNumber
  price: number;

  constructor(t: string, p: number) {
    this.title = t;
    this.price = p;
  }
}

const courseForm = document.querySelector("form")!;
courseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const titleEl = document.getElementById("title") as HTMLInputElement;
  const priceEl = document.getElementById("price") as HTMLInputElement;

  const title = titleEl.value;
  const price = +priceEl.value;

  const createdCourse = new Course(title, price);

  if (!validate(createdCourse)) {
    alert("Invalid input, please try again!");
    return;
  }
  console.log(createdCourse);
});
