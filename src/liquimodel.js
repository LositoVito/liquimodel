/**
 * Liquimodel, a series of utilities to implement MVVM pattern in react with a generic model without the need to define its structure 
 *
 * @version 0.0.1
 * @author [Vito Losito](https://github.com/LositoVito)
 * Linkedin: https://it.linkedin.com/in/vito-losito
 * License: CC BY-ND 4.0
 */

import _ from "lodash";
import { useState } from "react";

export function useModelManager() {
  const [model, setModel] = useState({});
  class Mutator {
    constructor(currentModel) {
      this.mod = _.cloneDeep(currentModel);
    }
    getModel() {
      return this.mod;
    }
    errorIfCheck(key, value, funcRes, func, args, funcPre, argsPre) {
      let val = _.get(this.mod, "val." + key, null);
      let valElab = val;
      if (funcPre !== undefined) valElab = funcPre(valElab, argsPre);
      let response = func(valElab, args);
      if (response === funcRes) this.setError(key, value);
      return response;
    }
    disableIfCheck(key, funcRes, func, args, funcPre, argsPre) {
      let val = _.get(this.mod, "val." + key, null);
      let valElab = val;
      if (funcPre !== undefined) valElab = funcPre(valElab, argsPre);
      let response = func(valElab, args);
      if (response === funcRes) this.setDisable(key, true);
      return response;
    }
    invisibleIfCheck(key, funcRes, func, args, funcPre, argsPre) {
      let val = _.get(this.mod, "val." + key, null);
      let valElab = val;
      if (funcPre !== undefined) valElab = funcPre(valElab, argsPre);
      let response = func(valElab, args);
      if (response === funcRes) this.setInvisible(key, true);
      return response;
    }
    mutateIf(change, funcRes, func, args) {
      let response = func(args);
      if (response === funcRes) this.mod = this.change(change);
      return response;
    }
    change(change) {
      applyChange(this.mod, change);
    }
    getValue(key) {
      return _.get(this.mod, "val." + key, null);
    }
    setValue(key, value) {
      _.set(this.mod, "val." + key, value);
    }
    getError(key) {
      return _.get(this.mod, "err." + key, null);
    }
    setError(key, value) {
      _.set(this.mod, "err." + key, value);
    }
    getDisable(key) {
      return _.get(this.mod, "dis." + key, null);
    }
    setDisable(key, value) {
      _.set(this.mod, "dis." + key, value);
    }
    getInvisible(key) {
      return _.get(this.mod, "inv." + key, null);
    }
    setInvisible(key, value) {
      _.set(this.mod, "inv." + key, value);
    }
    getAllDisable() {
      return this.mod.allDis;
    }
    setAllDisable(value) {
      this.mod.allDis = value;
    }
    removeFromArray(key) {
      this.mod = remove(key, this.mod);
    }
    addToArray(key, value = {}) {
      this.mod = add(key, this.mod, value);
    }
    isAnyError() {
      return checkError(this.mod.err);
    }
  }
  function normalizeObject(obj, bool) {
    let keys = Object.keys(obj);
    keys.forEach(function (key) {
      let value = obj[key];
      if (
        typeof value === "object" &&
        _.keysIn(value).length > 0 &&
        !_.isDate(value) &&
        !_.isArray(value)
      ) {
        normalizeObject(value, bool);
      } else if (
        _.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "object" &&
        !_.isDate(value[0])
      ) {
        obj[key].forEach((element) => normalizeObject(element, bool));
      } else {
        obj[key] = bool;
      }
    });
  }
  function checkError(obj) {
    var exists = false;
    let keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      let value = obj[key];
      if (
        typeof value === "object" &&
        _.keysIn(obj).length > 0 &&
        !_.isDate(obj && !_.isArray(value))
      ) {
        exists = checkError(value);
      } else if (
        _.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "object" &&
        !_.isDate(value[0])
      ) {
        for (var j = 0; j < value.length; j++) {
          exists = checkError(value[j]);
          if (exists) {
            break;
          }
        }
      } else if (value > 0) {
        exists = true;
      }
      if (exists) {
        break;
      }
    }
    return exists;
  }
  function applyChange(newModel, change) {
    let keys = Object.keys(change);
    keys.forEach(function (key) {
      let value = change[key];
      if (!_.isArray(value) && value.length > 0) {
        console.error(key + " value must be an array and must not be empty!");
        return;
      }
      if (value[0] !== undefined) _.set(newModel, "val." + key, value[0]);
      if (value.length > 1) {
        if (value[1] !== undefined && !_.isInteger(value[1]))
          console.error(key + " error value must be null or integer!");
        if (value[1] !== undefined) _.set(newModel, "err." + key, value[1]);
        if (value.length > 2) {
          if (value[2] !== undefined && !_.isBoolean(value[2]))
            console.error(key + " disable value must be null or boolean!");
          if (value[2] !== undefined) _.set(newModel, "dis." + key, value[2]);
          if (value.length > 3) {
            if (value[3] !== undefined && !_.isBoolean(value[3]))
              console.error(key + " invisible value must be null or boolean!");
            if (value[1] !== undefined) _.set(newModel, "inv." + key, value[3]);
          }
        }
      }
    });
    return newModel;
  }
  function remove(key, newModel) {
    let index = key.substring(key.indexOf("[") + 1, key.indexOf("]"));
    let arrayVal = _.get(
      newModel,
      "val." + key.substring(0, key.indexOf("[")),
      null
    );
    if (arrayVal === null) {
      console.error("Array " + key + " does not exists!");
      return;
    }
    _.pullAt(arrayVal, index);
    let arrayErr = _.get(
      newModel,
      "err." + key.substring(0, key.indexOf("[")),
      null
    );
    _.pullAt(arrayErr, index);
    let arrayDis = _.get(
      newModel,
      "dis." + key.substring(0, key.indexOf("[")),
      null
    );
    _.pullAt(arrayDis, index);
    let arrayInv = _.get(
      newModel,
      "inv." + key.substring(0, key.indexOf("[")),
      null
    );
    _.pullAt(arrayInv, index);
    _.set(newModel, "val." + key.substring(0, key.indexOf("[")), arrayVal);
    _.set(newModel, "err." + key.substring(0, key.indexOf("[")), arrayErr);
    _.set(newModel, "dis." + key.substring(0, key.indexOf("[")), arrayDis);
    _.set(newModel, "inv." + key.substring(0, key.indexOf("[")), arrayDis);
    return newModel;
  }
  function add(key, newModel, value) {
    let arrayVal = _.get(newModel, "val." + key, null);
    if (arrayVal === null) {
      console.error("Array " + key + " does not exists!");
      return;
    }
    arrayVal.push(value);
    let arrayErr = _.get(newModel, "err." + key, null);
    arrayErr.push(normalizeObject(value, 0));
    let arrayDis = _.get(newModel, "dis." + key, null);
    arrayDis.push(normalizeObject(value, false));
    let arrayInv = _.get(newModel, "inv." + key, null);
    arrayInv.push(normalizeObject(value, false));
    _.set(newModel, "val." + key, arrayVal);
    _.set(newModel, "err." + key, arrayErr);
    _.set(newModel, "dis." + key, arrayDis);
    _.set(newModel, "inv." + key, arrayDis);
    return newModel;
  }
  function cleanModel(mod) {
    if (mod === undefined) return {};
    let keys = Object.keys(mod);
    keys.forEach(function (key) {
      if (_.startsWith("key", "$$")) {
        delete mod[key];
      }
    });
    return mod;
  }
  const mm = {
    init: function (obj, idxArray = []) {
      for (let i = 0; i < idxArray.length; i++) {
        obj["$$" + idxArray[i]] = 0;
      }
      let error = _.cloneDeep(obj);
      normalizeObject(error, 0);
      let disabled = _.cloneDeep(obj);
      normalizeObject(disabled, false);
      let invisible = _.cloneDeep(obj);
      normalizeObject(invisible, false);
      setModel({
        val: obj,
        err: error,
        dis: disabled,
        inv: invisible,
        allDis: false
      });
    },
    getModel: function () {
      return cleanModel(model.val);
    },
    getMutator: function () {
      return new Mutator(model);
    },
    apply: function (mutator) {
      var mod = mutator.getModel();
      setModel(mod);
    },
    handleChange: function (key, value) {
      let newModel = _.cloneDeep(model);
      if (_.isDate(value)) value = value.toLocaleDateString("en-CA");
      _.set(newModel, "val." + key, value);
      _.set(newModel, "err." + key, 0);
      setModel(newModel);
    },
    handleChangeError: function (key, value) {
      let newModel = _.cloneDeep(model);
      _.set(newModel, "err." + key, value);
      setModel(newModel);
    },
    handleChangeDisable: function (key, value) {
      let newModel = _.cloneDeep(model);
      _.set(newModel, "dis." + key, value);
      setModel(newModel);
    },
    handleChangeInvisible: function (key, value) {
      let newModel = _.cloneDeep(model);
      _.set(newModel, "inv." + key, value);
      setModel(newModel);
    },
    handleMultiChange: function (change) {
      let newModel = _.cloneDeep(model);
      let newModelWithChange = applyChange(newModel, change);
      setModel(newModelWithChange);
    },
    value: function (key) {
      return _.get(model, "val." + key, null);
    },
    hasError: function (key) {
      if (_.get(model, "err." + key, 0) === 0) return false;
      else return true;
    },
    isDisabled: function (key) {
      if (model.allDis === true) return true;
      return _.get(model, "dis." + key, false);
    },
    isInvisible: function (key) {
      if (model.allDis === true) return true;
      return _.get(model, "inv." + key, false);
    },
    helper: function (key, value) {
      if (_.get(model, "err." + key, 0) === 0) return "";
      else return value[_.get(model, "err." + key, 1) - 1];
    },
    isAllDisabled: function () {
      return model.allDis;
    },
    disableAll: function (value) {
      let newModel = _.cloneDeep(model);
      normalizeObject(newModel, value);
      setModel(newModel);
    },
    removeFromArray: function (key) {
      let newModel = _.cloneDeep(model);
      let newModelWithChange = remove(key, newModel);
      setModel(newModelWithChange);
    },
    addToArray: function (key, value) {
      let newModel = _.cloneDeep(model);
      let newModelWithChange = add(key, newModel, value);
      setModel(newModelWithChange);
    },
    isAnyError: function () {
      return checkError(model.err);
    }
  };
  return mm;
}

export class CHK {
  static isEmpty(val) {
    if (val === null || val === undefined || val.trim() === "") return true;
    else return false;
  }
  static isEqual(val, arg) {
    if (this.isEmpty(val)) return false;
    if (val.trim() === arg) return true;
    else return false;
  }
  static startsWith(val, arg) {
    if (this.isEmpty(val)) return false;
    if (_.startsWith(val.trim(), arg)) return true;
    else return false;
  }
  static endsWith(val, arg) {
    if (this.isEmpty(val)) return false;
    if (_.endsWith(val.trim(), arg)) return true;
    else return false;
  }
  static contains(val, arg) {
    if (this.isEmpty(val)) return false;
    if (_.includes(val.trim(), arg)) return true;
    else return false;
  }
  static regex(val, arg) {
    if (this.isEmpty(val)) return false;
    var re = new RegExp(arg);
    if (re.test(val)) return true;
    else return false;
  }
  static isLessThen(val, arg) {
    if (!_.isNumber(val) || !_.isNumber(arg)) console.error("Not a number!");
    return _.lt(val, arg);
  }
  static isLessThenOrEqual(val, arg) {
    if (!_.isNumber(val) || !_.isNumber(arg)) console.error("Not a number!");
    return _.lte(val, arg);
  }
  static isGreaterThen(val, arg) {
    if (!_.isNumber(val) || !_.isNumber(arg)) console.error("Not a number!");
    return _.gt(val, arg);
  }
  static isGreaterThenOrEqual(val, arg) {
    if (!_.isNumber(val) || !_.isNumber(arg)) console.error("Not a number!");
    return _.gte(val, arg);
  }
  static isInRange(val, args) {
    if (!_.isNumber(val) || !_.isNumber(args[0] || !_.isNumber(args[1])))
      console.error("Not a number!");
    return _.gte(val, args[0]) && _.lte(val, args[1]);
  }
  static isInRangeExLower(val, args) {
    if (!_.isNumber(val) || !_.isNumber(args[0] || !_.isNumber(args[1])))
      console.error("Not a number!");
    return _.gt(val, args[0]) && _.lte(val, args[1]);
  }
  static isInRangeExUpper(val, args) {
    if (!_.isNumber(val) || !_.isNumber(args[0] || !_.isNumber(args[1])))
      console.error("Not a number!");
    return _.gte(val, args[0]) && _.lt(val, args[1]);
  }
  static isStrictlyInRange(val, args) {
    if (!_.isNumber(val) || !_.isNumber(args[0] || !_.isNumber(args[1])))
      console.error("Not a number!");
    return _.gte(val, args[0]) && _.lt(val, args[1]);
  }
  static isBefore(val, arg) {
    if (!_.isDate(arg)) console.error("Not a date!");
    var valDate = new Date(
      val.split("/")[0],
      val.split("/")[1] - 1,
      val.split("/")[2]
    );
    return valDate < arg;
  }
  static isBeforeOrEqual(val, arg) {
    if (!_.isDate(arg)) console.error("Not a date!");
    var valDate = new Date(
      val.split("/")[0],
      val.split("/")[1] - 1,
      val.split("/")[2]
    );
    return valDate <= arg;
  }
  static isAfter(val, arg) {
    if (!_.isDate(arg)) console.error("Not a date!");
    var valDate = new Date(
      val.split("/")[0],
      val.split("/")[1] - 1,
      val.split("/")[2]
    );
    return valDate > arg;
  }
  static isAfterOrEqual(val, arg) {
    if (!_.isDate(arg)) console.error("Not a date!");
    var valDate = new Date(
      val.split("/")[0],
      val.split("/")[1] - 1,
      val.split("/")[2]
    );
    return valDate >= arg;
  }
  static isBetween(val, args) {
    if (!_.isDate(args[0]) || !_.isDate(args[1])) console.error("Not a date!");
    var valDate = new Date(
      val.split("/")[0],
      val.split("/")[1] - 1,
      val.split("/")[2]
    );
    return valDate >= args[0] && valDate <= args[1];
  }
  static isBetweenExLower(val, args) {
    if (!_.isDate(args[0]) || !_.isDate(args[1])) console.error("Not a date!");
    var valDate = new Date(
      val.split("/")[0],
      val.split("/")[1] - 1,
      val.split("/")[2]
    );
    return valDate > args[0] && valDate <= args[1];
  }
  static isBetweenExUpper(val, args) {
    if (!_.isDate(args[0]) || !_.isDate(args[1])) console.error("Not a date!");
    var valDate = new Date(
      val.split("/")[0],
      val.split("/")[1] - 1,
      val.split("/")[2]
    );
    return valDate >= args[0] && valDate < args[1];
  }
  static isStrictlyBetween(val, args) {
    if (!_.isDate(args[0]) || !_.isDate(args[1])) console.error("Not a date!");
    var valDate = new Date(
      val.split("/")[0],
      val.split("/")[1] - 1,
      val.split("/")[2]
    );
    return valDate > args[0] && valDate < args[1];
  }
}
