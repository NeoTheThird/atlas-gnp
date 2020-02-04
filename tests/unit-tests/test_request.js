"use strict";

/*
 * Copyright (C) 2019-2020 Jan Sprinz <neo@neothethird.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const chai = require("chai");
const sinon = require("sinon");
const chaiAsPromised = require("chai-as-promised");
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

const request = require("../../src/scripts/request");

describe("request", function() {
  it("should resolve on response", function(done) {
    const sendSpy = sinon.spy();
    const openSpy = sinon.spy();
    global.XMLHttpRequest = class {
      constructor() {
        this.send = sendSpy;
        this.open = openSpy;
        this.onload = () => {};
        let _this = this;
        setTimeout(() => {
          _this.onload();
        }, 5);
        this.responseText = '{"some":"data"}';
      }
    };
    request("endpoint").then(r => {
      expect(r).to.eql({
        some: "data"
      });
      done();
    });
  });
});
