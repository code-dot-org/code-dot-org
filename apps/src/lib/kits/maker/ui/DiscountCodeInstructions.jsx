import React, {Component, PropTypes} from 'react';

export default class DiscountCodeInstructions extends Component {
  static propTypes = {
    discountCode: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div>
        <h1>Subsidized Circuit Playground Kits</h1>
        <h2>
          Discount code for subsidized kit: discountCode (Expires December 31, 2018)
        </h2>
        <div>
          We're happy to share with you this discount code that will bring down the cost of a $325 Circuit Playground kit to only $100 including shipping. We're excited that you will be bringing this opportunity to your students!
        </div>
        <div>
          To order your kit with the discount code, follow the steps below.
          <b>
            You must use your discount code by December 31, 2018.
          </b>
        </div>
        <ol>
          <li>
            Go to https://www.adafruit.com/product/3399 and add the kit to your cart.
          </li>
          <li>
            Go to your cart.
          </li>
          <li>
            Put in your discount code (discountCode) and hit "Apply":
          </li>
          <li>
            Proceed to checkout. Your total cost should be kitCost.
          </li>
        </ol>
      </div>
    );
  }
}
