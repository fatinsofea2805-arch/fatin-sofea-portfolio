const email = document.querySelector('.email').href.slice('mailto:'.length);
document.querySelector('#year').textContent = new Date().getFullYear();

const filters = document.querySelectorAll('.filter');
const projects = document.querySelectorAll('.project');
for (const filter of filters) {
  filter.addEventListener('click', () => {
    for (const option of filters) {
      option.classList.toggle('active', option === filter);
      option.setAttribute('aria-pressed', String(option === filter));
    }
    for (const project of projects) {
      const categories = project.dataset.category.split(' ');
      project.hidden = filter.dataset.filter !== 'all' && !categories.includes(filter.dataset.filter);
    }
  });
}

for (const button of document.querySelectorAll('.detail-button')) {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.dialog).showModal();
  });
}

const navLinks = [...document.querySelectorAll('.links a')];
const sections = navLinks.map(link => document.querySelector(link.hash)).filter(Boolean);
function updateNavigation() {
  const current = sections.findLast(section => section.getBoundingClientRect().top <= document.querySelector("header").offsetHeight + 20) ?? sections[0];
  for (const link of navLinks) {
    if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
window.addEventListener('scroll', updateNavigation, { passive: true });
updateNavigation();

document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(event.currentTarget);
  const subject = encodeURIComponent('Portfolio enquiry from ' + fields.get('name'));
  const body = encodeURIComponent(fields.get('message') + '\n\nFrom: ' + fields.get('name') + ' (' + fields.get('email') + ')');
  window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
});

const copyButton = document.querySelector('#copy');
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(email);
    copyButton.textContent = 'Email copied';
  } catch {
    copyButton.textContent = 'Select and copy the address above';
  }
});

const examples = {
  reward: {
    text: 'You’ve won a cash reward! Claim it today by entering your banking details.',
    clues: ['Claim it today', 'banking details'],
    explanation: 'A deadline pressures you to act, and a prize offer asking for bank details deserves scrutiny.'
  },
  delivery: {
    text: 'Your delivery is on hold. Pay a small redelivery fee now using the link in this message.',
    clues: ['redelivery fee now', 'the link in this message'],
    explanation: 'A surprise fee and a link are reasons to check the delivery directly with the courier.'
  },
  reminder: {
    text: 'Reminder: Your lab session starts at 10 am tomorrow in Computer Lab 2. Bring your student ID.',
    clues: [],
    explanation: 'This sample gives a time and location without asking for payment, account information, or a link click.'
  }
};

const exampleButtons = document.querySelectorAll('[data-example]');
const demoMessage = document.querySelector('#demo-message');
const demoFeedback = document.querySelector('.demo-feedback');
let selectedExample = examples.reward;

for (const button of exampleButtons) {
  button.addEventListener('click', () => {
    selectedExample = examples[button.dataset.example];
    for (const option of exampleButtons) {
      option.setAttribute('aria-pressed', String(option === button));
    }
    demoMessage.textContent = selectedExample.text;
    demoFeedback.textContent = '';
  });
}

document.querySelector('.demo-reveal').addEventListener('click', () => {
  const { text, clues, explanation } = selectedExample;
  const highlightedMessage = document.createDocumentFragment();
  let offset = 0;
  for (const clue of clues) {
    const start = text.indexOf(clue, offset);
    highlightedMessage.append(text.slice(offset, start));
    const mark = document.createElement('mark');
    mark.textContent = clue;
    highlightedMessage.append(mark);
    offset = start + clue.length;
  }
  highlightedMessage.append(text.slice(offset));
  demoMessage.replaceChildren(highlightedMessage);
  demoFeedback.textContent = explanation;
});
