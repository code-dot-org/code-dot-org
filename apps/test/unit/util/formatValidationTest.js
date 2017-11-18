import {isEmail} from '@cdo/apps/util/formatValidation';
import {expect} from 'chai';

describe("formatValidation", () => {
  describe("isEmail", () => {
    it("Accepts valid email addresses", () => {
      [
        "name@code.org",
        "name+tag@code.org"
      ].forEach(email => {
        expect(isEmail(email), `Expected isEmail("${email}") to return true`).to.be.true;
      });
    });

    it("Rejects invalid email addresses", () => {
      [
        "invalid",
        "invalid@code",
        "invalid@ code.org"
      ].forEach(email => {
        expect(isEmail(email), `Expected isEmail("${email}") to return false`).to.be.false;
      });
    });
  });
});
