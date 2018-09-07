import React, {Component, PropTypes} from 'react';
import viewCart from "@cdo/static/maker/viewCart.png";
import addToCart from "@cdo/static/maker/addToCart.png";
import enterDiscountCode from "@cdo/static/maker/enterDiscountCode.png";

const styles = {
  title: {
    fontSize: 32,
  },
  image: {
    width: 300,
    marginTop: 10,
    marginLeft: 50
  },
  step: {
    marginTop: 25,
    fontSize: 16
  },
  bold: {
    fontFamily: '"Gotham 7r", sans-serif',
    display: 'inline',
  }
};

export default class DiscountCodeInstructions extends Component {
  static propTypes = {
    discountCode: PropTypes.string.isRequired,
    fullDiscount: PropTypes.bool.isRequired,
    expiration: PropTypes.string.isRequired,
  };

  render() {
    // Date formated to be in form "December 31, 2018"
    const expiration = (new Date(this.props.expiration)).toLocaleString('en-us',
      {timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric'});

    return (
      <div>
        <h1 style={styles.title}>Subsidized Circuit Playground Kits</h1>
        <h2>
          <div>Discount code for subsidized kit: {this.props.discountCode}</div>
          <div>(Expires {expiration})</div>
        </h2>
        <div>
          We're happy to share with you this discount code that will bring down the cost of a $350 Circuit Playground kit to{" "}
          {this.props.fullDiscount ? "$0" : "only $97.50"} including standard ground shipping.
          We're excited that you will be bringing this opportunity to your students!
        </div>
        <br/>
        <div>
          To order your kit with the discount code, follow the steps below.{" "}
          <div style={styles.bold}>You must use your discount code by December 31, 2018.</div>
        </div>

        <div style={styles.step}>
          <div>
            1) Go to <a href="https://www.adafruit.com/product/3399">https://www.adafruit.com/product/3399</a>
          {" "}and add the kit to your cart.
          </div>
          <a href={addToCart}>
            <img style={styles.image} src={addToCart}/>
          </a>
        </div>
        <div style={styles.step}>
          <div>
            2) Go to your cart.
          </div>
          <a href={viewCart}>
            <img style={styles.image} src={viewCart}/>
          </a>
        </div>
        <div style={styles.step}>
          <div>
            3) Put in your discount code ({this.props.discountCode}) and hit "Apply".
          </div>
          <a href={enterDiscountCode}>
            <img style={styles.image} src={enterDiscountCode}/>
          </a>
        </div>
        <div style={styles.step}>
          4) Proceed to checkout. Your total cost should be {this.props.fullDiscount ? "$0" : "$97.50"}.
        </div>
        <div style={{marginTop: 20}}>
          If you run into any issues with ordering on the Adafruit website, please check out{" "}
          <a href="https://www.adafruit.com/support">https://www.adafruit.com/support</a>.
          For any other questions, please contact <a href="mailto:teacher@code.org">teacher@code.org.</a>
        </div>
      </div>
    );
  }
}
