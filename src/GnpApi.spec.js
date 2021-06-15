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

jest.mock("axios");
jest.mock("./Geocoder");
jest.mock("./utils");

const { default: axios } = require("axios");
const GnpApi = require("./GnpApi.js");
const utils = require("./utils.js");

describe("GnpApi module", function () {
  describe("constructor()", function () {
    it("should construct object", function () {
      const gnpApi = new GnpApi("asdf", "wasd", "omg");
      expect(gnpApi.host).toEqual("asdf");
      expect(gnpApi.token).toEqual("wasd");
      expect(gnpApi.geo).toBeDefined;
      expect(gnpApi.cachetime).toEqual(60);
      expect(gnpApi.cache).toEqual({});
    });
  });
  describe("get()", function () {
    it("should resolve endpoint", function (done) {
      axios.get.mockResolvedValue({
        data: {
          test: "data"
        }
      });
      utils.time.mockReturnValue(1234);

      const api = new GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );

      // HACK test hasOwnPrototype
      /**
       *
       */
      function extra() {
        this.additional = "stuff";
      }
      extra.prototype = { some: "bs" };

      api.get("testendpoint", new extra()).then(r => {
        expect(r).toEqual({
          test: "data"
        });
        expect(api.cache).toEqual({
          "https://www.testurl.com?json&function=testendpoint&additional=stuff&token=gnpApiToken":
            {
              data: { test: "data" },
              expires: 1294
            }
        });
        expect(axios.get).toHaveBeenCalledWith(
          "https://www.testurl.com?json&function=testendpoint&additional=stuff&token=gnpApiToken"
        );
        done();
      });
    });
    it("should resolve cache", function (done) {
      utils.time.mockReturnValue(1234);
      axios.get.mockClear();

      const api = new GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );

      api.cache = {
        "https://www.testurl.com?json&function=testendpoint&additional=stuff&token=gnpApiToken":
          {
            data: { test: "data" },
            expires: 1337
          }
      };

      api
        .get("testendpoint", {
          additional: "stuff"
        })
        .then(r => {
          expect(r).toEqual({
            test: "data"
          });
          expect(api.cache).toEqual({
            "https://www.testurl.com?json&function=testendpoint&additional=stuff&token=gnpApiToken":
              {
                data: { test: "data" },
                expires: 1337
              }
          });
          expect(axios.get).not.toHaveBeenCalled();
          done();
        });
    });
    it("should reject on error", function (done) {
      axios.get.mockRejectedValue("everything exploded");

      const api = new GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );

      api.get("testendpoint").catch(e => {
        expect(e.message).toEqual("everything exploded");
        expect(api.cache).toEqual({});
        expect(axios.get).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
  describe("getMembers()", function () {
    it("should resolve members", function () {
      const api = new GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );
      api.get = jest.fn().mockResolvedValue({
        test: "data"
      });
      api.getMembers().then(r => {
        expect(r).toEqual({
          test: "data"
        });
        expect(api.get).toHaveBeenCalledWith("GetMembers", {
          felder: "",
          filter: ""
        });
      });
    });
  });
  describe("getMember()", function () {
    it("should resolve members", function () {
      const api = new GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );
      api.get = jest.fn().mockResolvedValue({
        test: "data"
      });
      api.getMember().then(r => {
        expect(r).toEqual({
          test: "data"
        });
        expect(api.get).toHaveBeenCalledWith("GetMember", {
          id: undefined
        });
      });
    });
  });
  describe("getAtlas()", function () {
    it("should resolve members", function () {
      const api = new GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );
      utils.formatUrlLabel.mockReturnValue("");
      api.getMembers = jest.fn().mockResolvedValue([
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
        get: jest.fn().mockResolvedValue([1, 2])
      };
      api.getAtlas().then(r =>
        expect(r).toEqual([
          {
            latlong: [1, 2],
            color: "blue",
            popup:
              "<h1>test data test data test data</h1><hr><h2>test data</h2><p>test data<br>test data test data<br>test data<br></p><p></p>"
          }
        ])
      );
    });
    it("should resolve cache", function (done) {
      utils.time.mockReturnValue(1234);

      const api = new GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );

      api.cache = {
        atlas: {
          data: { test: "data" },
          expires: 1294
        }
      };

      api.getAtlas().then(r => {
        expect(r).toEqual({
          test: "data"
        });
        expect(api.cache).toEqual({
          atlas: {
            data: { test: "data" },
            expires: 1294
          }
        });
        done();
      });
    });
  });
  describe("countryFilter()", function () {
    [
      "NRW",
      "Nordrhein-Westfalen",
      "Schleswig-Holstein",
      "Rheinland-Pfalz",
      "RLP",
      "Saarland",
      "Baden-Württemberg",
      "BaWü",
      "Ba-Wü",
      "Bayern",
      "Berlin",
      "Brandenburg",
      "Bremen",
      "Hamburg",
      "Hessen",
      "Mecklenburg-Vorpommern",
      "Niedersachsen",
      "Sachsen",
      "Sachsen-Anhalt",
      "Thüringen"
    ].forEach(state =>
      it("should filter " + state, function () {
        const api = new GnpApi(
          "https://www.testurl.com",
          "gnpApiToken",
          "geoApiToken"
        );
        expect(
          api.countryFilter([
            {
              g_land: state
            }
          ])
        ).toEqual([
          {
            g_land: "Deutschland (" + state + ")"
          }
        ]);
      })
    );
    ["D", "GER", ""].forEach(alias =>
      it("should filter " + alias, function () {
        const api = new GnpApi(
          "https://www.testurl.com",
          "gnpApiToken",
          "geoApiToken"
        );
        expect(
          api.countryFilter([
            {
              g_land: alias
            }
          ])
        ).toEqual([
          {
            g_land: "Deutschland"
          }
        ]);
      })
    );
    ["A"].forEach(alias =>
      it("should filter " + alias, function () {
        const api = new GnpApi(
          "https://www.testurl.com",
          "gnpApiToken",
          "geoApiToken"
        );
        expect(
          api.countryFilter([
            {
              g_land: alias
            }
          ])
        ).toEqual([
          {
            g_land: "Österreich"
          }
        ]);
      })
    );
  });
  describe("getStats()", function () {
    it("should resolve stats", function (done) {
      utils.time.mockReturnValue(1234);
      const api = new GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );
      api.cache = {
        atlas: {
          expires: 1337
        }
      };
      api.getAtlas = jest
        .fn()
        .mockResolvedValue([
          { popup: false },
          { popup: false },
          { popup: true }
        ]);
      api.getRawAtlasMembers = jest.fn().mockResolvedValue([]);
      api.getStats().then(r => {
        expect(r).toEqual({
          hidden: -3,
          nopopup: 2,
          popup: 1,
          age: 43
        });
        done();
      });
    });
  });
  describe("atlasFilter()", function () {
    it("should sanitize data", function () {
      const api = new GnpApi(
        "https://www.testurl.com",
        "gnpApiToken",
        "geoApiToken"
      );
      expect(
        api.atlasFilter([
          {
            key_atlasjn: "NEIN NEIN NEIN"
          },
          {
            key_atlasjn: "",
            key_mitgliedsstatus: "Mitglied",
            key_atlasfreigabe2: "",
            g_land: "country",
            g_ort: "ort",
            g_plz: "1337",
            g_strasse: "street"
          },
          {
            key_atlasjn: "",
            key_mitgliedsstatus: "Außerordentliches Mitglied, natürl. Person",
            key_atlasfreigabe2: "",
            g_land: "country",
            g_ort: "ort",
            g_plz: "1337",
            g_strasse: "street"
          },
          {
            key_atlasjn: "Ja",
            key_atlasfreigabe1: "Var. 3",
            key_atlasfreigabe2: "Zusatz 2",
            key_mitgliedsstatus: "Senior, ohne NEP",
            g_land: "country",
            g_ort: "ort",
            g_plz: "1337",
            g_strasse: "street",
            berufsfunktion: "berufsfunktion",
            beschreibung: "beschreibung",
            branche: "branche",
            g_co: "C/O",
            g_homepage: "example.com",
            g_telefon: 123,
            firma: "firma",
            nachname: "nachname",
            vorname: "vorname",
            name: "name",
            titel: "Dr. Dr. Dr."
          },
          {
            key_atlasjn: "Ja",
            key_atlasfreigabe1: "Var. 4",
            key_atlasfreigabe2: "Zusatz 2",
            key_mitgliedsstatus: "Ehrenmitglied",
            g_land: "country",
            g_ort: "ort",
            g_plz: "1337",
            g_strasse: "street",
            berufsfunktion: "berufsfunktion",
            beschreibung: "beschreibung",
            branche: "branche",
            g_co: "C/O",
            g_homepage: "example.com",
            g_mobil: 12345,
            g_telefon: 123,
            firma: "firma",
            nachname: "nachname",
            vorname: "vorname",
            name: "name",
            titel: "Dr. Dr. Dr.",
            g_email: "g_email"
          },
          {
            key_atlasjn: "Ja",
            key_atlasfreigabe1: "Var. 5",
            key_atlasfreigabe2: "Zusatz 2",
            key_mitgliedsstatus: "Junior",
            g_land: "country",
            g_ort: "ort",
            g_plz: "1337",
            g_strasse: "street",
            berufsfunktion: "berufsfunktion",
            beschreibung: "beschreibung",
            branche: "branche",
            g_co: "C/O",
            g_homepage: "example.com",
            g_mobil: 12345,
            g_telefon: 123,
            firma: "firma",
            nachname: "nachname",
            vorname: "vorname",
            name: "name",
            titel: "Dr. Dr. Dr.",
            g_email: "g_email"
          }
        ])
      ).toEqual([
        {
          color: "blue",
          g_land: "country",
          g_ort: "ort",
          g_plz: "1337",
          g_strasse: "street",
          popup: false
        },
        {
          color: "black",
          g_land: "country",
          g_ort: "ort",
          g_plz: "1337",
          g_strasse: "street",
          popup: false
        },
        {
          berufsfunktion: "berufsfunktion",
          beschreibung: "beschreibung",
          branche: "branche",
          color: "grey",
          g_co: "C/O",
          g_homepage: "example.com",
          g_land: "country",
          g_ort: "ort",
          g_plz: "1337",
          g_strasse: "street",
          g_telefon: 123,
          popup: true,
          firma: "firma",
          nachname: "nachname",
          vorname: "vorname",
          name: "name",
          titel: "Dr. Dr. Dr."
        },
        {
          berufsfunktion: "berufsfunktion",
          beschreibung: "beschreibung",
          branche: "branche",
          color: "gold",
          firma: "firma",
          g_co: "C/O",
          g_email: "g_email",
          g_homepage: "example.com",
          g_land: "country",
          g_mobil: 12345,
          g_ort: "ort",
          g_plz: "1337",
          g_strasse: "street",
          nachname: "nachname",
          name: "name",
          popup: true,
          titel: "Dr. Dr. Dr.",
          vorname: "vorname"
        },
        {
          berufsfunktion: "berufsfunktion",
          beschreibung: "beschreibung",
          branche: "branche",
          color: "lightblue",
          firma: "firma",
          g_co: "C/O",
          g_email: "g_email",
          g_homepage: "example.com",
          g_land: "country",
          g_mobil: 12345,
          g_telefon: 123,
          g_ort: "ort",
          g_plz: "1337",
          g_strasse: "street",
          nachname: "nachname",
          name: "name",
          popup: true,
          titel: "Dr. Dr. Dr.",
          vorname: "vorname"
        }
      ]);
    });
  });
  describe("createAtlasLabelHtml()", function () {
    it("should create label", function () {
      utils.formatUrlLabel.mockReturnValue("label");
      expect(
        GnpApi.createAtlasLabelHtml({
          popup: true,
          g_ort: "ort",
          g_co: "C/O",
          g_plz: "1337",
          g_strasse: "street",
          g_land: "country",
          berufsfunktion: "chef vom dienst",
          branche: "branche",
          beschreibung: "beschreibung",
          g_homepage: "g_homepage"
        })
      ).toEqual(
        "<h1></h1><h3>chef vom dienst</h3><hr><a href='g_homepage' target=_blank></a><h3>C/O</h3><p>street<br>1337 ort<br>country<br></p><p>labellabellabellabellabel</p><hr><h3>Beschreibung und Tätigkeitsschwerpunkte</h3><p>Art der Einrichtung: branche</p>beschreibung"
      );
      expect(
        GnpApi.createAtlasLabelHtml({
          popup: true,
          g_ort: "ort",
          g_co: "C/O",
          g_plz: "1337",
          g_strasse: "street",
          g_land: "country",
          berufsfunktion: "chef vom dienst",
          branche: "branche",
          g_homepage: "g_homepage"
        })
      ).toEqual(
        "<h1></h1><h3>chef vom dienst</h3><hr><a href='g_homepage' target=_blank></a><h3>C/O</h3><p>street<br>1337 ort<br>country<br></p><p>labellabellabellabellabel</p><hr><h3>Beschreibung und Tätigkeitsschwerpunkte</h3><p>Art der Einrichtung: branche</p>"
      );
      expect(
        GnpApi.createAtlasLabelHtml({
          popup: true,
          g_ort: "ort",
          g_co: "C/O",
          g_plz: "1337",
          g_strasse: "street",
          g_land: "country",
          berufsfunktion: "chef vom dienst",
          beschreibung: "beschreibung",
          g_homepage: "g_homepage"
        })
      ).toEqual(
        "<h1></h1><h3>chef vom dienst</h3><hr><a href='g_homepage' target=_blank></a><h3>C/O</h3><p>street<br>1337 ort<br>country<br></p><p>labellabellabellabellabel</p><hr><h3>Beschreibung und Tätigkeitsschwerpunkte</h3>beschreibung"
      );
    });
    it("should return false if no label needed", function () {
      expect(GnpApi.createAtlasLabelHtml({ popup: false })).toEqual(false);
    });
  });
});
