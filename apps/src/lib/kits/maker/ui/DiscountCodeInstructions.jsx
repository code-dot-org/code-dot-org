import React, {Component, PropTypes} from 'react';
import viewCart from "@cdo/static/maker/viewCart.png";
import addToCart from "@cdo/static/maker/addToCart.png";
import enterDiscountCode from "@cdo/static/maker/enterDiscountCode.png";

const styles = {
  title: {
    fontSize: 32,
  },
  image: {
    width: 400,
  }
};

export default class DiscountCodeInstructions extends Component {
  static propTypes = {
    discountCode: PropTypes.string.isRequired,
    fullDiscount: PropTypes.bool.isRequired,
  };

  render() {
    return (
      <div>
        <h1 style={styles.title}>Subsidized Circuit Playground Kits</h1>
        <h2>Discount code for subsidized kit: {this.props.discountCode} (Expires December 31, 2018)</h2>
        <div>
          We're happy to share with you this discount code that will bring down the cost of a $325 Circuit Playground kit to
          {this.props.fullDiscount ? "$0" : "only $97.50"} including shipping.
          We're excited that you will be bringing this opportunity to your students!
        </div>
        <br/>
        <div>
          To order your kit with the discount code, follow the steps below.
          <b>
            You must use your discount code by December 31, 2018.
          </b>
        </div>
        <br/>
        <ol>
          <li>
            <div>
              <div>
                Go to <a href="https://www.adafruit.com/product/3399">https://www.adafruit.com/product/3399</a>
                and add the kit to your cart.
              </div>
              <img style={styles.image} src={addToCart}/>
            </div>
          </li>
          <li>
            <div>
              <div>
                Go to your cart.
              </div>
              <img style={styles.image} src={viewCart}/>
            </div>
          </li>
          <li>
            <div>
              <div>
                Put in your discount code ({this.props.discountCode}) and hit "Apply":
              </div>
              <img style={styles.image} src={enterDiscountCode}/>
            </div>
          </li>
          <li>
            Proceed to checkout. Your total cost should be {this.props.fullDiscount ? "$0" : "$97.50"}.
          </li>
        </ol>
        <div>
          If you run into any issues with ordering on the Adafruit website, please check out
          <a href="https://www.adafruit.com/support">https://www.adafruit.com/support</a>.
          For any other questions, please contact teacher@code.org.
        </div>
      </div>
    );
  }
}
