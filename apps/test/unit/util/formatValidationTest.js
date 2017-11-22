import {
  isEmail,
  isZipCode
} from '@cdo/apps/util/formatValidation';
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

  describe("isZipCode", () => {
    it("Accepts valid zip codes", () => {
      [
        "12345",
        "12345-6789",
        "12345 6789"
      ].forEach(zipCode => {
        expect(isZipCode(zipCode), `Expected isZipCode("${zipCode}") to return true`).to.be.true;
      });
    });

    it("Rejects invalid zip codes", () => {
      [
        "",
        "123",
        "12345-",
        "12345-1",
        "ABCDE"
      ].forEach(zipCode => {
        expect(isZipCode(zipCode), `Expected isZipCode("${zipCode}") to return false`).to.be.false;
      });
    });
  });
});
