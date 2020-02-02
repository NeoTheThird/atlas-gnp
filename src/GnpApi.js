const request = require("request-promise-native");
const Geocoder = require("./Geocoder");
const utils = require("./utils");

const geo = new Geocoder();

/**
 * get current time in seconds
 *
 * @returns {number} - time in seconds
 */
const time = () => Math.floor(new Date() / 1000);

/**
 * @class GnpApi
 * @classdesc An api client with caching
 */
class GnpApi {
  /**
   * @constructs GnpApi
   * @param {string} host - host url
   * @param {string} token - A/$USER/MD5($PASSWORD)
   * @param {number} [cachetime=60] - how many seconds to keep cache
   */
  constructor(host, token, cachetime = 60) {
    this.host = host;
    this.token = token;
    this.cachetime = cachetime;
    this.cache = {};
  }

  /**
   * Get an endpoint, use cache if valid
   *
   * @param {string} endpoint - an api function
   * @param {object} [extra] - extra parameters
   * @returns {Promise} - resolves data or rejects error
   */
  get(endpoint, extra = {}) {
    let now = time();
    let extraString = "";
    for (const property in extra) {
      if (extra.hasOwnProperty(property)) {
        extraString += "&" + property + "=" + extra[property];
      }
    }
    let url =
      this.host +
      "?json&function=" +
      endpoint +
      extraString +
      "&token=" +
      this.token;
    //console.log(url);
    if (this.cache[url] && this.cache[url].expires > now) {
      //console.log("use cache gnp");
      return Promise.resolve(this.cache[url].data);
    } else {
      //console.log("get new gnp");
      return request(url)
        .then(JSON.parse)
        .then(res => {
          this.cache[url] = {
            data: res,
            expires: now + this.cachetime
          };
          return res;
        })
        .catch(err => {
          throw new Error(err);
        });
    }
  }

  /**
   * Get all members
   *
   * @param {string[]} [fields] - additional fields to request
   * @param {string} [filter] - WHERE part of sql query (key_ fields do not work here)
   * @returns {Promise} - resolves members or rejects error
   */
  getMembers(fields = [], filter = "") {
    return this.get("GetMembers", {
      felder: fields.join(","),
      filter: filter
    });
  }

  /**
   * Get a single member
   *
   * @param {number} id - internal id
   * @returns {Promise} - resolves members or rejects error
   */
  getMember(id) {
    return this.get("GetMember", { id: id });
  }

  /**
   * Get members for atlas
   *
   * @returns {Promise} - resolves members or rejects error
   */
  getAtlas() {
    let now = time();
    if (this.cache["atlas"] && this.cache["atlas"].expires > now) {
      //console.log("use cache atlas");
      return Promise.resolve(this.cache["atlas"].data);
    } else {
      return this.getMembers(
        [
          "g_strasse",
          "g_land",
          "g_plz",
          "g_ort",
          "g_co",
          "g_homepage",
          "g_telefon",
          "g_mobil",
          "g_email",
          "titel",
          "firma",
          "berufsfunktion",
          "funktion",
          "beschreibung",
          "branche",
          "vorname",
          "nachname",
          "key_atlasjn",
          "key_atlasfreigabe1",
          "key_atlasfreigabe2",
          "key_mitgliedsstatus"
        ],
        "g_strasse is not null and g_strasse <> '' and " +
          "g_plz is not null and g_plz <> '' and " +
          "g_ort is not null and g_ort <> '' and " +
          "g_land is not null and g_land <> ''"
      )
        .then(this.atlasFilter)
        .then(this.countryFilter)
        .then(members => {
          return members.filter(member => {
            return geo
              .get(
                member.g_strasse +
                  " " +
                  member.g_plz +
                  " " +
                  member.g_ort +
                  " " +
                  member.g_land +
                  " "
              )
              .then(latlong =>
                Object.assign(member, {
                  latlong: latlong
                })
              );
          });
        })
        .then(members => members.filter(member => member.latlong))
        .then(members =>
          members.map(member => {
            return {
              latlong: member.latlong,
              color: member.color,
              popup: GnpApi.createAtlasLabelHtml(member)
            };
          })
        )
        .then(members => {
          //console.log("updated atlas cache")
          this.cache["atlas"] = {
            data: members,
            expires: now + this.cachetime
          };
          return members;
        });
    }
  }

  /**
   * Fixes the country
   *
   * @param {object[]} members - members returned from the api
   * @returns {object[]} - members with country fixed
   */
  countryFilter(members) {
    return members.map(member => {
      let ret = member;
      switch (member.g_land) {
        case "NRW":
        case "Nordrhein-Westfalen":
        case "Schleswig-Holstein":
        case "Rheinland-Pfalz":
        case "RLP":
        case "Saarland":
        case "Baden-Württemberg":
        case "BaWü":
        case "Ba-Wü":
        case "Bayern":
        case "Berlin":
        case "Brandenburg":
        case "Bremen":
        case "Hamburg":
        case "Hessen":
        case "Mecklenburg-Vorpommern":
        case "Niedersachsen":
        case "Sachsen":
        case "Sachsen-Anhalt":
        case "Thüringen":
          ret.g_land = "Deutschland (" + member.g_land + ")";
          return ret;
        case "GER":
        case "D":
        case "":
          ret.g_land = "Deutschland";
          return ret;
        case "A":
          ret.g_land = "Österreich";
          return ret;
        default:
          return ret;
      }
    });
  }

  /**
   * Filters out members who do not want to be listed and sanitizes fields
   *
   * @param {object[]} members - members returned from the api
   * @returns {object[]} - sanitized members
   */
  atlasFilter(members) {
    return members
      .filter(member => {
        return (
          !member.key_atlasjn.startsWith("NEIN") &&
          (member.key_mitgliedsstatus === "Ehrenmitglied" ||
            member.key_mitgliedsstatus ===
              "Außerordentliches Mitglied, natürl. Person" ||
            member.key_mitgliedsstatus === "Senior, ohne NEP" ||
            member.key_mitgliedsstatus === "Junior" ||
            member.key_mitgliedsstatus === "Junior, Elternzeit" ||
            member.key_mitgliedsstatus === "Mitglied")
        );
      })
      .map(member => {
        let ret = {
          g_strasse: member.g_strasse,
          g_land: member.g_land,
          g_plz: member.g_plz,
          g_ort: member.g_ort,
          popup: true
        };
        // Set color
        ret.color = member.key_mitgliedsstatus.includes("Ehrenmitglied")
          ? "gold"
          : member.key_mitgliedsstatus.includes("Außerordentliches Mitglied")
          ? "black"
          : member.key_mitgliedsstatus.includes("Junior")
          ? "lightblue"
          : member.key_mitgliedsstatus.includes("Senior")
          ? "grey"
          : "blue";
        // Display everyone who has not explicitly opted out
        if (member.key_atlasjn === "") {
          member.key_atlasfreigabe1 = "Var. 1";
        }
        // general information
        if (member.key_atlasfreigabe1.startsWith("Var. 1")) {
          // no popup
          ret.popup = false;
        } else {
          // anonymous
          ret.name = member.name;
          ret.nachname = member.nachname;
          ret.vorname = member.vorname;
          ret.titel = member.titel;
          ret.firma = member.firma;
          if (member.key_atlasfreigabe1.startsWith("Var. 3")) {
            // plus Telefon und Fax
            ret.g_telefon = member.g_telefon;
          } else if (member.key_atlasfreigabe1.startsWith("Var. 4")) {
            // plus E-Mail und Mobil-Nummer
            ret.g_email = member.g_email;
            ret.g_mobil = member.g_mobil;
          } else if (member.key_atlasfreigabe1.startsWith("Var. 5")) {
            // plus Tel., Fax, E-Mail und Mobil-Nr
            ret.g_telefon = member.g_telefon;
            ret.g_email = member.g_email;
            ret.g_mobil = member.g_mobil;
          }
        }
        // additional information
        if (member.key_atlasfreigabe2.startsWith("Zusatz 2")) {
          ret.g_homepage = member.g_homepage;
          ret.g_co = member.g_co;
          ret.berufsfunktion = member.berufsfunktion;
          ret.branche = member.branche;
          ret.beschreibung = member.beschreibung;
        }
        return ret;
      });
  }

  /**
   * Create an atlas label html string
   *
   * @param {object} m - member returned from the api
   * @returns {string} - sanitized members
   */
  static createAtlasLabelHtml(m) {
    if (m.popup) {
      let head =
        "<h1>" +
        ((m.titel ? m.titel + " " : "") +
          (m.vorname ? m.vorname + " " : "") +
          (m.nachname ? m.nachname : "")) +
        "</h1>" +
        (m.berufsfunktion ? "<h3>" + m.berufsfunktion + "</h3>" : "");
      let address =
        "<hr>" +
        (m.g_homepage ? "<a href='" + m.g_homepage + "' target=_blank>" : "") +
        (m.firma ? "<h2>" + m.firma + "</h2>" : "") +
        (m.g_homepage ? "</a>" : "") +
        (m.g_co ? "<h3>" + m.g_co + "</h3>" : "") +
        "<p>" +
        m.g_strasse +
        "<br>" +
        m.g_plz +
        " " +
        m.g_ort +
        "<br>" +
        m.g_land +
        "<br>" +
        "</p><p>" +
        utils.formatUrlLabel("Homepage: ", m.g_homepage) +
        utils.formatUrlLabel("Telefon: ", m.g_telefon, "tel:") +
        utils.formatUrlLabel("Fax: ", m.g_fax, "tel:") +
        utils.formatUrlLabel("Mail: ", m.g_email, "mailto:") +
        utils.formatUrlLabel("Mobil: ", m.g_mobil, "tel:") +
        "</p>";
      let about =
        m.branche || m.beschreibung
          ? "<hr>" +
            "<h3>Beschreibung und Tätigkeitsschwerpunkte</h3>" +
            (m.branche ? "<p>Art der Einrichtung: " + m.branche + "</p>" : "") +
            (m.beschreibung ? m.beschreibung.trim() : "")
          : "";
      return head + address + about;
    } else {
      return false;
    }
  }
}

module.exports = (host, token, cachetime) => new GnpApi(host, token, cachetime);
