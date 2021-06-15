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

const utils = require("../../src/utils.js");

describe("utils", function () {
  describe("formatUrlLabel()", function () {
    it("should format label if empty", function () {
      expect(utils.formatUrlLabel()).to.eql("");
    });
    it("should format label with protocol", function () {
      expect(
        utils.formatUrlLabel("Phone", "https://example.com", "tel:")
      ).to.eql(
        "Phone<a href='tel:https://example.com' target=_blank>example.com</a><br>"
      );
    });
    it("should format label", function () {
      expect(utils.formatUrlLabel("Phone", "example.com")).to.eql(
        "Phone<a href='example.com' target=_blank>example.com</a><br>"
      );
    });
  });
  describe("time()", function () {
    it("should return time", function () {
      expect(utils.time()).to.exist;
    });
  });
});
