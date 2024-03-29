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

const getUrlParameters = require("./get-url-parameters");

describe("get-url-parameters", function () {
  it("should return url parameters", function () {
    global.window = {
      location: {
        href: "https://example.awesome/somelocation/?test=data&something=false&number=42&else=true"
      }
    };
    expect(getUrlParameters()).toEqual({
      number: "42",
      something: false,
      else: "true",
      test: "data"
    });
  });
});
