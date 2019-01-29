import React, {Component, PropTypes} from 'react';
import UnsafeRenderedMarkdown from '../../../../templates/UnsafeRenderedMarkdown';

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
          <UnsafeRenderedMarkdown markdown={overviewMd}/>
        </div>

        <div style={styles.step}>
          <div>
            1) Go to <a href="https://www.adafruit.com/product/3399">https://www.adafruit.com/product/3399</a>
          {" "}and add the kit to your cart.
          </div>
          <a href="https://images.code.org/maker/addToCart_19.png">
            <img style={styles.image} src="https://images.code.org/maker/addToCart_19.png"/>
          </a>
        </div>
        <div style={styles.step}>
          <div>
            2) Go to your cart.
          </div>
          <a href="https://images.code.org/maker/viewCart_19.png">
            <img style={styles.image} src="https://images.code.org/maker/viewCart_19.png"/>
          </a>
        </div>
        <div style={styles.step}>
          <div>
            3) Put in your discount code ({this.props.discountCode}) and hit "Apply".
          </div>
          <a href="https://images.code.org/maker/enterDiscountCode_19.png">
            <img style={styles.image} src="https://images.code.org/maker/enterDiscountCode_19.png"/>
          </a>
        </div>
        <div style={styles.step}>
          4) Proceed to checkout. Your total cost should be $0.
        </div>
        <div style={{marginTop: 20}}>
          <UnsafeRenderedMarkdown markdown={endnoteMd}/>
        </div>
      </div>
    );
  }
}

const overviewMd = `
We're happy to share with you this discount code that will fully cover the cost of a $350 Circuit
Playground kit. We're excited that you will be bringing this opportunity to your students!

To order your kit with the discount code, follow the steps below.
**You must use your discount code by December 31, 2019.**
`;

const endnoteMd = `
If you run into any issues with ordering on the Adafruit website, please check out
[https://www.adafruit.com/support](https://www.adafruit.com/support).
For any other questions, please contact [teacher@code.org](mailto:teacher@code.org).
`;
