// tutorial-transcript.js

// !!!README: 
// This file contains the video transcipt for each tutorial in the tutorial index.
// Each object in the TUTORIAL_INDEX array has a title and a transcript property.
// The title is used to identify the tutorial, and the transcript contains the text to be searched.

window.TUTORIAL_INDEX = [
  
  // ============================
  // === Set Up Your Course =====
  // ============================
  
  {
    title: "Course Author Page Overview",
    transcript: `Course Author Page Overview: This is the course author landing page. On the left side, you will see the workspace menu, which confirms that you are logged in as an author. If you ever need to switch roles, you can do so by selecting a different role from this menu. On a course author page, you will find a list of all your projects, also known as courses. From here you can easily access each project. Now, let's get started by creating a new project.`
  },
  {
    title: "Create a New Project",
    transcript: `To create a new project, simply click the new project button. Enter a name for your project. That he created to get started. Once your project is created, you can begin working on your course right away. You can also return to your course later by clicking its project title from your project list.`
  },
  {
    title: "Set Up Your Project: Course Overview",
    transcript: `When you enter a course, you will be taken to the overview page for that course. Here you can enter and adjust some basic information and settings for your course. The first step is setting up your project title, which you already entered when creating the course. You can change this at any time. Next, it's recommended to add a project description to provide context for your course. If you're designing a language course, you may want to adjust the learning language on the project attributes. If you're designing a course with course specific names for the structural elements of units, modules, sections, you may want to adjust the project labels to customize these containers.`
  },
{
    title: "Collaborators Visibility",
    transcript: 'Collaborators Visibility: By default, collaborators can see each other. To hide collaborator names, uncheck "Show names of other collaborators".'
  },
  {
    title: "Project Attributes",
    transcript: `Project Attributes: ...`
  },
  
  {
    title: "Project Labels",
    transcript: `Project Labels: Torus follows a default hierarchy of units, modules, sections, where a unit can contain multiple modules and a module can contain multiple sections. Units, modules, and sections can all contain pages with course content. You can rename these containers to better fit your course structure. For example, if your course is structured by weeks, you can rename units to weeks to reflect the weekly progression of your lessons. If you're designing a language course, you can rename these structural containers in your target language.`
  },
{
    title: "Advanced Activities",
    transcript: `Advanced Activities:...`
  },
{
    title: "Discussion, Notes, and Survey",
    transcript: `Discussion, Notes, and Survey:...`
  },
 {
    title: "Transformation Payment Code",
    transcript: `Transformation Payment Code: ...`
  },

  // ============================
  // === Develop Your Course ====
  // ============================

  {
    title: "Learning Objectives",
    transcript: `Learning Objectives: Learning objectives are the foundation of backward design and analysis. Attach objectives to pages and activities. See the CMU Eberly Center guide to learn why mapping objectives matters for student success.`
  },
  {
    title: "Create Sub-Learning Objectives",
    transcript: `Create Sub-Learning Objectives: ...`
  },
  {
    title: "Create Containers",
    transcript: `Create Containers: The curriculum tab in the course author menu is where you will edit your course structure and course content.

Remember, Torus follows a default hierarchy of Units → Modules → Sections, where:
A Unit can contain multiple Modules
A Module can contain multiple Sections
(Units, Modules, and Sections can all contain Pages with course content.)
If you want, can rename these containers in Overview to better fit your course structure.
To set the structure of your course, you can start by creating a unit. Click “Create a Unit”. Your new Unit will be created, with the default name “Unit 1: Unit”. Torus numbers the Units automatically. As you create or rearrange more Units, Torus will update the numbering accordingly. 
To change the name of a Unit, click the drop down menu, click ‘Options: menu, change the title, and click save
Inside your unit, you can create a module, following the same steps you used to create the unit
Then inside of the module, you can create a section, again follow the same steps.
You can create as many Units, Modules, and Sections as you need for your course structure. You can also create Pages at any level of the structure - inside a Section, Module, or Unit, or at the top level of your curriculum.
`
  },
  {
    title: "Create A Page",
    transcript: `Create A Page: Now let’s add some pages! 
To create a new page, start by selecting ‘Practice’ in this box . Once selected, a new page will appear here.
If you want to add a page inside a specific unit,module, or section, simply click on the container and just create a page here.
A Practice Page is intended for ungraded activities, allowing learners to engage with the content without impacting their scores. In contrast, a Scored Page is used for graded activities, such as assessments, checkpoints, and exams.
You’ll notice that Practice Pages and Scored Pages have distinct icons in your curriculum list. These icons help you easily differentiate between content types and track the structure of your course.

`
  },
  {
    title: "Practice Page Options",
    transcript: `Practice Page Options: As with Units and other containers, Page Titles will be seen by both you and students in your course structure. Page Titles will also appear at the top of their page. In general, page titles should be meaningful and descriptive of the content on the page. There are two ways to change the Page Title. First, as with containers, open the drop-down menu, select ‘Options’, and update the page title here.

In the Page Options menu, you'll see that since you selected a Practice Page, the Scoring Type is set to ‘Unscored Practice Page’ by default. 


A: If you change your mind and want to turn your Practice Page into a Scored Page, you can change the Scoring Type to Scored Assessment and continue to adjust the Scored Page Options for this page.

Remember to always click save at the end when you’ve finished editing the Page Options.
`
  },
  {
    title: "Edit & Save Page",
    transcript: `Edit & Save Page: Now let’s click “edit page” to create and edit your page content.
First things first, Torus automatically saves all the changes you make while you are editing page content, so you don’t need to click any button to save your editing progress. 
`
  },
  {
    title: "Edit Page Title",
    transcript: 'Edi Page Title: The one exception is the Page Title., If you wou ld like to edit your page title while you are editing your page content, click Edit Title to edit your title, and click save to save your modified title. This save button is only needed to save the new title, not the page content, because page content is, again, automatically saved.'
  },

  {
    title: "Add Learning Objectives in Page",
    transcript: 'In accordance with Learning Engineering practices, all pages should generally have Learning Objectives. You have already seen how you can create learning objectives from the Learning Objectives page . At the top of each content page in a Torus course, you can select or create learning objectives for that page. If you already created a learning objective that you want to map to the page, you can select and attach it by checking the box beside it in the drop-down menu. You can also create a new learning objective here by directly typing it in the Learning Objectives bar, and clicking Create new objective when you’re done. You can have multiple learning objectives on the same page.'
  },

  {
    title: "Add Paragraph",
    transcript: 'Add Paragraph: Torus allows you to add multiple kinds of content to a page. When you first enter a new page, you will see the entry box where you will be able to author your content. At the bottom, you will see Insert Content, which is the small plus icon with a line indicating its position. You will always see this button while you edit a page. Above that, you will see the instructions “Type here or use + to begin…” The new page has pre-created a paragraph block to help you begin adding content. In a paragraph block, you can add rich content such as text, images, tables, YouTube, etc. First, of course, you can add text by typing directly.  For more options, you can use the menu that appears when you click inside the paragraph block. You can bold and italicize, format your text as code, and add hyperlinks.'
  }
];