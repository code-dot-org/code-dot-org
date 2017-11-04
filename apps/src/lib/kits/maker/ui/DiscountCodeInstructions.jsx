import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";

export default class DiscountCodeInstructions extends Component {
  static propTypes = {
    discountCode: PropTypes.string.isRequired,
    discountComplete: PropTypes.bool.isRequired,
  };

  render() {
    return (
      <div>
        <h1>{i18n.subsidizedPlaygroundKit()}</h1>
        <h2>{i18n.discountCode({discountCode: this.props.discountCode})}</h2>
        <div>
          {i18n.discountCodeAnnouncement({discountAmount: this.props.discountComplete ? "$0" : "only $97.50 (including standard ground shipping)"})}
        </div>
        <div>
          {i18n.discountCodeOrderInstructions()}
          <b>
            {i18n.discountCodeExpiration()}
          </b>
        </div>
        <ol>
          <li>
            {i18n.discountCodeInstructions1()}
          </li>
          <li>
            {i18n.discountCodeInstructions2()}
          </li>
          <li>
            {i18n.discountCodeInstructions3({discountCode: this.props.discountCode})}
          </li>
          <li>
            {i18n.discountCodeInstructions4({kitCost: this.props.discountComplete ? "$0" : "$97.50"})}
          </li>
        </ol>
        <div>{i18n.discountCodeHelpAdafruit()} <a href="https://www.adafruit.com/support">https://www.adafruit.com/support</a> {i18n.discountCodeHelpInternal()}</div>
      </div>
    );
  }
}
