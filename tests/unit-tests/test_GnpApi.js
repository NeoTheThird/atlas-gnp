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
const proxyquire = require("proxyquire").noCallThru();
const chaiAsPromised = require("chai-as-promised");
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

const GnpApi = require("../../src/GnpApi.js");

describe("GnpApi module", function() {
  describe("constructor()", function() {
    it("should construct object", function() {
      const gnpApi = new GnpApi("asdf", "wasd", "omg");
      expect(gnpApi.host).to.eql("asdf");
      expect(gnpApi.token).to.eql("wasd");
      expect(gnpApi.geo).to.exist;
      expect(gnpApi.cachetime).to.eql(60);
      expect(gnpApi.cache).to.eql({});
    });
  });
  describe("get()", function() {
    it("should resolve endpoint", function(done) {
      const requestFake = sinon.fake.resolves(
        JSON.stringify({
          test: "data"
        })
      );
      const _GnpApi = proxyquire("../../src/GnpApi", {
        "request-promise-native": requestFake,
        "./utils": {
          time: () => 1234
        }
      });

      const api = new _GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );

      api
        .get("testendpoint", {
          additional: "stuff"
        })
        .then(r => {
          expect(r).to.eql({
            test: "data"
          });
          expect(api.cache).to.eql({
            "https://www.testurl.com?json&function=testendpoint&additional=stuff&token=gnpApiToken": {
              data: { test: "data" },
              expires: 1294
            }
          });
          expect(requestFake).to.have.been.calledWith(
            "https://www.testurl.com?json&function=testendpoint&additional=stuff&token=gnpApiToken"
          );
          done();
        });
    });
    it("should resolve cache", function(done) {
      const requestFake = sinon.spy();
      const _GnpApi = proxyquire("../../src/GnpApi", {
        "request-promise-native": requestFake,
        "./utils": {
          time: () => 1234
        }
      });

      const api = new _GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );

      api.cache = {
        "https://www.testurl.com?json&function=testendpoint&additional=stuff&token=gnpApiToken": {
          data: { test: "data" },
          expires: 1294
        }
      };

      api
        .get("testendpoint", {
          additional: "stuff"
        })
        .then(r => {
          expect(r).to.eql({
            test: "data"
          });
          expect(api.cache).to.eql({
            "https://www.testurl.com?json&function=testendpoint&additional=stuff&token=gnpApiToken": {
              data: { test: "data" },
              expires: 1294
            }
          });
          expect(requestFake).to.not.have.been.called;
          done();
        });
    });
    it("should reject on error", function(done) {
      const requestFake = sinon.fake.rejects("everything exploded");
      const _GnpApi = proxyquire("../../src/GnpApi", {
        "request-promise-native": requestFake
      });

      const api = new _GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );

      api.get("testendpoint").catch(e => {
        expect(e.message).to.eql("Error: everything exploded");
        expect(api.cache).to.eql({});
        expect(requestFake).to.have.been.calledOnce;
        done();
      });
    });
  });
  describe("getMembers()", function() {
    it("should resolve members", function() {
      const api = new GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );
      api.get = sinon.fake.resolves({
        test: "data"
      });
      api.getMembers().then(r => {
        expect(r).to.eql({
          test: "data"
        });
        expect(api.get).to.have.been.calledWith("GetMembers", {
          felder: "",
          filter: ""
        });
      });
    });
  });
  describe("getMember()", function() {
    it("should resolve members", function() {
      const api = new GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );
      api.get = sinon.fake.resolves({
        test: "data"
      });
      api.getMember().then(r => {
        expect(r).to.eql({
          test: "data"
        });
        expect(api.get).to.have.been.calledWith("GetMember", {
          id: undefined
        });
      });
    });
  });
  describe("getAtlas()", function() {
    it("should resolve members", function() {
      const api = new GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );
      api.getMembers = sinon.fake.resolves([
        {
          g_strasse: "test data",
          g_land: "test data",
          g_plz: "test data",
          g_ort: "test data",
          g_co: "test data",
          g_homepage: "test data",
          g_telefon: "test data",
          g_mobil: "test data",
          g_email: "test data",
          titel: "test data",
          firma: "test data",
          berufsfunktion: "test data",
          funktion: "test data",
          beschreibung: "test data",
          branche: "test data",
          vorname: "test data",
          nachname: "test data",
          key_atlasjn: "test data",
          key_atlasfreigabe1: "test data",
          key_atlasfreigabe2: "test data",
          key_mitgliedsstatus: "Mitglied"
        }
      ]);
      api.geo = {
        get: sinon.fake.resolves([1, 2])
      };
      api.getAtlas().then(r => {
        expect(r).to.eql([
          {
            latlong: [1, 2],
            color: "blue",
            popup:
              "<h1>test data test data test data</h1><hr><h2>test data</h2><p>test data<br>test data test data<br>test data<br></p><p></p>"
          }
        ]);
      });
    });
    it("should resolve cache", function(done) {
      const _GnpApi = proxyquire("../../src/GnpApi", {
        "./utils": {
          time: () => 1234
        }
      });

      const api = new _GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );

      api.cache = {
        "atlas": {
          data: { test: "data" },
          expires: 1294
        }
      };

      api
        .getAtlas()
        .then(r => {
          expect(r).to.eql({
            test: "data"
          });
          expect(api.cache).to.eql({
            "atlas": {
              data: { test: "data" },
              expires: 1294
            }
          });
          done();
        });
    });
  });
});
