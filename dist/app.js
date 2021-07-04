"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
function Logger(constructor) {
    console.log("Decorator  Logging...");
    console.log(constructor);
}
let Person = class Person {
    constructor() {
        this.name = "Max";
        console.log("creating person object...");
    }
};
Person = __decorate([
    Logger
], Person);
const pers = new Person();
console.log(pers);
function LoggerF(logstring) {
    return function (constructor) {
        console.log(logstring);
        console.log(constructor);
    };
}
let PersonF = class PersonF {
    constructor() {
        this.name = "Max";
        console.log("creating person object...");
    }
};
PersonF = __decorate([
    LoggerF("LOGGING - PERSON")
], PersonF);
function WithTemplate(template, hookId) {
    return function (_) {
        const hookEL = document.getElementById(hookId);
        if (hookEL) {
            hookEL.innerHTML = template;
        }
    };
}
let PersonT = class PersonT {
    constructor() {
        this.name = "Max";
        console.log("creating person object...");
    }
};
PersonT = __decorate([
    WithTemplate(`<h1>My Person Object</h1>`, "app")
], PersonT);
function WithTemplateA(template, hookId) {
    return function (constructor) {
        const hookEL = document.getElementById(hookId);
        const p = new constructor();
        if (hookEL) {
            hookEL.innerHTML = template;
            hookEL.querySelector("h1").textContent = p.name;
        }
    };
}
let PersonA = class PersonA {
    constructor() {
        this.name = "Max";
        console.log("creating person object...");
    }
};
PersonA = __decorate([
    Logger,
    WithTemplateA(`<h1>My Person Object</h1>`, "app")
], PersonA);
function Log(target, propertyName) {
    console.log("property decorator");
    console.log(`target: `, target);
    console.log(`property Name: `, propertyName);
}
function Log2(target, name, descriptor) {
    console.log("Accessor Decorator");
    console.log(target);
    console.log(name);
    console.log(descriptor);
}
function Log3(target, name, descriptor) {
    console.log("Method Decorator");
    console.log(target);
    console.log(name);
    console.log(descriptor);
}
function Log4(target, name, position) {
    console.log("Parameter Decorator");
    console.log(target);
    console.log(name);
    console.log(position);
}
class Product {
    constructor(title, price) {
        this.title = title;
        this._price = price;
    }
    get price() {
        return this._price;
    }
    set price(value) {
        if (value > 0) {
            this._price = value;
        }
        else {
            throw new Error("Invalid price - should be positive");
        }
    }
    getPriceWithTax(tax) {
        return this._price * (1 + tax);
    }
}
__decorate([
    Log
], Product.prototype, "title", void 0);
__decorate([
    Log2
], Product.prototype, "price", null);
__decorate([
    Log3,
    __param(0, Log4)
], Product.prototype, "getPriceWithTax", null);
function WithTemplateR(template, hookId) {
    console.log("TEMPLATE FACTORY");
    return function (originalConstructor) {
        return class extends originalConstructor {
            constructor(..._) {
                super();
                console.log("Rendering template");
                const hookEl = document.getElementById(hookId);
                if (hookEl) {
                    hookEl.innerHTML = template;
                    hookEl.querySelector("h1").textContent = this.name;
                }
            }
        };
    };
}
let PersonR = class PersonR {
    constructor() {
        this.name = "Max";
        console.log("creating person object...");
    }
};
PersonR = __decorate([
    WithTemplateR(`<h1>My Person Object</h1>`, "app")
], PersonR);
const perso = new Person();
console.log(perso);
function AutoBind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    console.log("descriptor    ", descriptor);
    const adjustedDescriptor = {
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
    constructor() {
        this.message = "This Works!";
    }
    showMessage() {
        console.log(this.message);
    }
}
__decorate([
    AutoBind
], Printer.prototype, "showMessage", null);
const p = new Printer();
const button = document.querySelector("button");
button.addEventListener("click", p.showMessage);
const registeredValidators = {};
function Required(target, propName) {
    registeredValidators[target.constructor.name] = Object.assign(Object.assign({}, registeredValidators[target.constructor.name]), { [propName]: ["required"] });
}
function PositiveNumber(target, propName) {
    registeredValidators[target.constructor.name] = Object.assign(Object.assign({}, registeredValidators[target.constructor.name]), { [propName]: ["positive"] });
}
function validate(obj) {
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
    constructor(t, p) {
        this.title = t;
        this.price = p;
    }
}
__decorate([
    Required
], Course.prototype, "title", void 0);
__decorate([
    PositiveNumber
], Course.prototype, "price", void 0);
const courseForm = document.querySelector("form");
courseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const titleEl = document.getElementById("title");
    const priceEl = document.getElementById("price");
    const title = titleEl.value;
    const price = +priceEl.value;
    const createdCourse = new Course(title, price);
    if (!validate(createdCourse)) {
        alert("Invalid input, please try again!");
        return;
    }
    console.log(createdCourse);
});
//# sourceMappingURL=app.js.map