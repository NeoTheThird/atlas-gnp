"use strict";

/*
 * Copyright (C) 2019-2021 Jan Sprinz <neo@neothethird.de>
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

jest.mock("node-geocoder");
jest.mock("node-storage");

const Geocoder = require("./Geocoder.js");
const CACHE_PATH = __dirname + "/../test-data/.geo-cache";

describe("Geocoder module", function () {
  describe("constructor()", function () {
    it("should construct object", function () {
      const geocoder = new Geocoder("asdf", CACHE_PATH);
      expect(geocoder.cache).toBeDefined;
      expect(geocoder.api).toBeDefined;
      const geocoder_null = new Geocoder();
      expect(geocoder_null.cache).toBeDefined;
      expect(geocoder_null.api).toBeDefined;
    });
  });
  describe("get()", function () {
    it("should throw on invalid api key", function (done) {
      const geocoder = new Geocoder("asdf", CACHE_PATH);
      geocoder.api = {
        geocode: jest.fn().mockRejectedValue("invalid api key")
      };
      geocoder.cache = {
        get: jest.fn()
      };
      geocoder.get("test").catch(e => {
        expect(geocoder.api.geocode).toHaveBeenCalledWith("test");
        expect(e.message).toEqual("invalid api key");
        done();
      });
    });
    it("resolve cached coordinates", function (done) {
      const geocoder = new Geocoder("asdf", CACHE_PATH);
      geocoder.cache = {
        get: jest.fn().mockReturnValue("data")
      };
      geocoder.get("test").then(r => {
        expect(geocoder.cache.get).toHaveBeenCalledWith("test");
        done();
      });
    });
    it("resolve cached coordinates", function (done) {
      const geocoder = new Geocoder("asdf", CACHE_PATH);
      geocoder.api = {
        geocode: jest.fn().mockResolvedValue("data")
      };
      geocoder.cache = {
        get: jest.fn(),
        put: jest.fn()
      };
      geocoder.get("test").then(r => {
        expect(geocoder.cache.get).toHaveBeenCalledWith("test");
        expect(geocoder.cache.put).toHaveBeenCalled();
        expect(geocoder.api.geocode).toHaveBeenCalledWith("test");
        done();
      });
    });
  });
});
