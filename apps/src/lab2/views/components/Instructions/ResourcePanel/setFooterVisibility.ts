import styles from './styles.module.scss';

/**
 * Shows or hides the page small footer, which is rendered by the server in HAML.
 * Allows us to hide the footer when the resource panel is show, since the resource
 * panel includes copyright and language information.
 */
export default function setFooterVisibility(show: boolean) {
  const footer = document.getElementById('page-small-footer');
  if (!show) {
    footer?.classList.add(styles.hiddenFooter);
  } else if (footer?.classList.contains(styles.hiddenFooter)) {
    footer.classList.remove(styles.hiddenFooter);
  }
}
