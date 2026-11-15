const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");

function setMenuOpen(isOpen) {
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  primaryNavigation.classList.toggle("is-open", isOpen);
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
});

primaryNavigation.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

const previewTabs = [...document.querySelectorAll('[role="tab"]')];

function activatePreviewTab(tab, moveFocus = false) {
  for (const currentTab of previewTabs) {
    const isSelected = currentTab === tab;
    currentTab.setAttribute("aria-selected", String(isSelected));
    currentTab.tabIndex = isSelected ? 0 : -1;
    document
      .getElementById(currentTab.getAttribute("aria-controls"))
      .toggleAttribute("hidden", !isSelected);
  }

  if (moveFocus) {
    tab.focus();
  }
}

for (const tab of previewTabs) {
  tab.addEventListener("click", () => activatePreviewTab(tab));

  tab.addEventListener("keydown", (event) => {
    const currentIndex = previewTabs.indexOf(tab);
    let nextIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % previewTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + previewTabs.length) % previewTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = previewTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    activatePreviewTab(previewTabs[nextIndex], true);
  });
}

const workflowSteps = [
  {
    title: "Record",
    description:
      "Staff would record or import product details and transactions. This concept page does not accept uploads.",
  },
  {
    title: "Check",
    description:
      "A future system would validate entries and update stock. Validation and stock updates are not implemented here.",
  },
  {
    title: "Review",
    description:
      "Owners could review sales, purchasing and stock summaries, including records that may need attention.",
  },
  {
    title: "Consider",
    description:
      "Eligible items could receive forecast suggestions after comparison with a baseline. No forecast is calculated in this mockup.",
  },
  {
    title: "Decide",
    description:
      "A person would check the supporting records and choose what to do. The proposal does not include autonomous purchasing.",
  },
];

const workflowButtons = [...document.querySelectorAll(".workflow-step")];
const workflowPosition = document.querySelector("#workflow-position");
const workflowTitle = document.querySelector("#workflow-title");
const workflowDescription = document.querySelector("#workflow-description");
const workflowPrevious = document.querySelector("#workflow-previous");
const workflowNext = document.querySelector("#workflow-next");
let selectedWorkflowStep = 0;

function selectWorkflowStep(index, moveFocus = false) {
  if (index < 0 || index >= workflowSteps.length) {
    return;
  }

  selectedWorkflowStep = index;
  const step = workflowSteps[index];

  workflowButtons.forEach((button, buttonIndex) => {
    if (buttonIndex === index) {
      button.setAttribute("aria-current", "step");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  workflowPosition.textContent = `Step ${index + 1} of ${workflowSteps.length}`;
  workflowTitle.textContent = step.title;
  workflowDescription.textContent = step.description;
  workflowPrevious.disabled = index === 0;
  workflowNext.disabled = index === workflowSteps.length - 1;

  if (moveFocus) {
    workflowButtons[index].focus();
  }
}

workflowButtons.forEach((button, index) => {
  button.addEventListener("click", () => selectWorkflowStep(index));

  button.addEventListener("keydown", (event) => {
    let nextIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % workflowSteps.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + workflowSteps.length) % workflowSteps.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = workflowSteps.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    selectWorkflowStep(nextIndex, true);
  });
});

workflowPrevious.addEventListener("click", () => {
  selectWorkflowStep(selectedWorkflowStep - 1);
});

workflowNext.addEventListener("click", () => {
  selectWorkflowStep(selectedWorkflowStep + 1);
});

const navigationLinks = [...document.querySelectorAll(".primary-navigation a")];
const navigableSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter((section) => section instanceof HTMLElement);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const currentSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)[0];

      if (!currentSection) {
        return;
      }

      for (const link of navigationLinks) {
        if (link.hash === `#${currentSection.target.id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      }
    },
    { rootMargin: "-18% 0px -70% 0px", threshold: 0 },
  );

  navigableSections.forEach((section) => sectionObserver.observe(section));
}

const scrollProgress = document.querySelector(".scroll-progress");
let progressUpdateScheduled = false;

function updateScrollProgress() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  scrollProgress.style.setProperty("--scroll-progress", String(Math.min(progress, 1)));
  progressUpdateScheduled = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!progressUpdateScheduled) {
      progressUpdateScheduled = true;
      window.requestAnimationFrame(updateScrollProgress);
    }
  },
  { passive: true },
);

window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();
