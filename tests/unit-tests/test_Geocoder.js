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

const Geocoder = require("../../src/Geocoder.js");
const CACHE_PATH = __dirname + "/../test-data/.geo-cache";

describe("Geocoder module", function() {
  describe("constructor()", function() {
    it("should construct object", function() {
      const geocoder = new Geocoder("asdf", CACHE_PATH);
      expect(geocoder.cache).to.exist;
      expect(geocoder.api).to.exist;
    });
    it("should throw if no key is specified", function(done) {
      try {
        new Geocoder();
      } catch(e) {
        expect(e.message).to.eql("MapQuestGeocoder needs an apiKey");
        done();
      }
    });
  });
  describe("get()", function() {
    it("should throw on invalid api key", function(done) {
      const geocoder = new Geocoder("asdf", CACHE_PATH);
      geocoder.api = {
        geocode: sinon.fake.rejects("invalid api key")
      }
      geocoder.cache = {
        get: sinon.fake.returns(undefined)
      }
      geocoder.get("test").catch(e => {
        expect(geocoder.api.geocode).to.have.been.calledWith("test");
        expect(e.message).to.eql("Error: invalid api key");
        done();
      });
    });
    it("resolve cached coordinates", function(done) {
      const geocoder = new Geocoder("asdf", CACHE_PATH);
      geocoder.cache = {
        get: sinon.fake.returns("data")
      }
      geocoder.get("test").then(r => {
        expect(geocoder.cache.get).to.have.been.calledWith("test");
        done();
      });
    });
    it("resolve cached coordinates", function(done) {
      const geocoder = new Geocoder("asdf", CACHE_PATH);
      geocoder.api = {
        geocode: sinon.fake.resolves("data")
      }
      geocoder.cache = {
        get: sinon.fake.returns(undefined),
        put: sinon.spy()
      }
      geocoder.get("test").then(r => {
        expect(geocoder.cache.get).to.have.been.calledWith("test");
        expect(geocoder.cache.put).to.have.been.called;
        expect(geocoder.api.geocode).to.have.been.calledWith("test");
        done();
      });
    });
  });
});
