import { Component } from 'react';
import './App.css';

const state_init = () => {
  let ks = [...keys_questions];
  shuffle(ks);
  let k = ks.pop();
  return {
    n_questions: keys_questions.length,
    key_question: k,
    keys_questions: ks,
    answers: {},
    answers_count: 0,
    hide_instructions: false,
    hide_answers_table: false,
    hide_contradictions_table: false
  }
}
export default class App extends Component {
  constructor() {
    super();
    
    this.state = state_init();
  }

  isFinished() {
    return this.state.answers_count === this.state.n_questions;
  }

  render() {
    return (
      <div className='App'>
        <div className='header'>
          <div className='header-title'>
            Philosophical Consistency Test
          </div>
        </div>
        <div className='content'>
          {this.renderStatus()}
          {
            this.isFinished()
              ? this.renderReport()
              : this.renderQuery()
          }
        </div>
      </div>
    );
  }

  renderQuery() {
    return (
      <div>
        {this.renderQuestion()}
        {this.renderInstructions()}
      </div>
    )

  }

  renderInstructions() {
    let instructions_className = "instructions";
    if (this.state.hide_instructions) instructions_className += " hidden";

    return (
      <div className='instructions'>

        <div className='title' onClick={event => {
          let state = this.state;
          state.hide_instructions = !state.hide_instructions;
          this.setState(state);
        }}>
          {this.state.hide_instructions ? "▶" : "▼"} Instructions
        </div>

        <div className={instructions_className}>
          <ul>
            <li>
              If you believe the claim is true, then click "{renderTrue()}". Otherwise, click "{renderFalse()}".
            </li>
            <li>
              Each claim is phrased very carefully to be unambiguous, precise, and literal, so please read each carefully as well.
              Do not read into any claims any implicit sub-claims that are neither logically implied nor explicitly included.
            </li>
            <li>
              If there is any part of a claim that you don't believe, then you don't believe the claim, so you should click "{renderFalse()}".
            </li>
            <li>
              If you aren't entirely sure if a claim is true, but you are more sure that is is true than the negation, then you do in fact believe the claim, so you should click "{renderTrue()}".
            </li>
          </ul>
          {this.renderAnswersUploader()}
        </div>
      </div>
    );
  }

  renderStatus() {
    if (this.isFinished()) {
      // finished, viewing answers
      return (
        <div className='status'>
          <div>
            <b>Status.</b> Test finished
          </div>
        </div>
      );
    } else {
      // in progress, viewing question
      return (
        <div className='status'>
          <div>
            <b>Status.</b> Test in progress
          </div>
          {this.renderStatusBar()}
        </div>
      );
    }
  }

  renderStatusBar() {
    let items = [];
    for (let i = 0; i < this.state.n_questions; i++) {
      if (i === this.state.answers_count) {
        items.push(<div className='question-status-item active'></div>);
      } else
        if (i < this.state.answers_count) {
          items.push(<div className='question-status-item done'></div>);
        } else {
          items.push(<div className='question-status-item todo'></div>);
        }
    }
    return (
      <div className='status-bar'>
        {items}
      </div>
    )
  }

  submitAnswer(value) {
    let ks = [...this.state.keys_questions];
    let k = ks.pop();

    let answers = this.state.answers;
    answers[this.state.key_question] = value;

    let state = this.state;
    state.key_question = k;
    state.keys_questions = ks;
    state.answers = answers;
    state.answers_count++;
    this.setState(state);
  }

  renderQuestion() {
    return (
      <div className='question'>
        <div className='title'>Question</div>
        <div className='question-description'>
          <b>Claim.</b> {questions[this.state.key_question]}
        </div>
        <div className='question-answers'>
          <div className='question-answer question-answer-true' onClick={event => this.submitAnswer(true)}>{renderTrue()}</div>
          <div className='question-answer question-answer-false' onClick={event => this.submitAnswer(false)}>{renderFalse()}</div>
        </div>
      </div>
    );
  }

  renderReport() {
    return (
      <div>
        {this.renderAnswersDownloader()}
        {this.renderRestart()}
        {this.renderContradictions()}
        {this.renderAnswers()}
      </div>
    )
  }

  renderAnswersDownloader() {
    let data_str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.answers));
    return (
      <div>
        <a
          className='answers-downloader'
          href={data_str}
          download="answers.json"
        >
          Download answers
        </a>
      </div>
    );
  }

  renderRestart() {
    return (
      <div>
        <button className='restart' onClick={event => this.setState(state_init())}>
          Restart test
        </button>
      </div>
    )
  }

  renderAnswersUploader() {
    return (
      <div>
        Upload answers:
        <input type="file" className='answers-uploader' onChange={event => {
          let reader = new FileReader();
          reader.onload = event => {
            let answers = JSON.parse(event.target.result);
            let state = this.state;
            state.answers = answers;
            state.answers_count = state.n_questions;
            this.setState(state);
          }
          reader.readAsText(event.target.files[0]);
        }}>
        </input>
      </div>
    )
  }

  renderAnswers() {
    let rows = [];
    for (let [answer_key, answer_value] of Object.entries(this.state.answers)) {
      rows.push(
        <tr>
          <td>
            {questions[answer_key]}
          </td>
          <td>
            {answer_value ? renderTrue() : renderFalse()}
          </td>
        </tr>
      );
    }

    let answers_table_className = "answers-table";
    if (this.state.hide_answers_table) answers_table_className += " hidden";


    return (
      <div className='answers'>

        <div className='title' onClick={event => {
          let state = this.state;
          state.hide_answers_table = !state.hide_answers_table;
          this.setState(state);
        }}>
          {this.state.hide_answers_table ? "▶" : "▼"} Answers
        </div>

        <div className={answers_table_className}>
          <table>
            <tbody>
              <tr>
                <th>
                  Question
                </th>
                <th>
                  Answer
                </th>
              </tr>
              {rows}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  renderContradictoryAnswers(answers) {
    function agreed_or_disagreed(value) { return value ? <span className="true">agreed</span> : <span className='false'>disagreed</span>; }

    let elems = [];
    for (let i = 0; i < answers.length; i++) {
      let answer = answers[i];
      if (i === 0) {
        elems.push(
          <p>
            <p>You {agreed_or_disagreed(answer.value)} that</p>
            <p className='quote'>{questions[answer.key]}</p>
          </p>
        );
      } else if (i === 1) {
        elems.push(
          <p>
            <p>yet you {agreed_or_disagreed(answer.value)} that</p>
            <p className='quote'>{questions[answer.key]}</p>
          </p>
        );
      } else {
        elems.push(
          <p>
            <p>and you {agreed_or_disagreed(answer.value)} that</p>
            <p className='quote'>{questions[answer.key]}</p>
          </p>
        );
      }
    }

    return elems;
  }

  renderContradictions() {
    let rows = [];
    console.log(contradictions);
    for (let contradiction of contradictions) {
      console.log(contradiction);
      let isContradictory = true;
      for (let answer of contradiction.answers) {
        isContradictory = isContradictory && this.state.answers[answer.key] === answer.value;
      }
      if (isContradictory) {
        rows.push(
          <tr>
            <td>
              {this.renderContradictoryAnswers(contradiction.answers)}
            </td>
            <td>
              <p>
                {contradiction.description}
              </p>
            </td>
          </tr>
        )
      }
    }

    let contradictions_table_className = "contradictions-table";
    if (this.state.hide_contradictions_table) contradictions_table_className += " hidden";
    return (
      <div className='contradictions'>

        <div className='title' onClick={event => {
          let state = this.state;
          state.hide_contradictions_table = !state.hide_contradictions_table;
          this.setState(state);
        }}>
          {this.state.hide_contradictions_table ? "▶" : "▼"} Contradictions
        </div>

        <div className={contradictions_table_className}>
          <table>
            <tbody>
              <tr>
                <th>
                  Answers in Tension
                </th>
                <th>
                  Contradiction
                </th>
              </tr>
              {rows}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

function renderTrue() { return (<span className='true'>TRUE</span>) }
function renderFalse() { return (<span className='false'>FALSE</span>) }

const questions = {
  art1: "The value in art is entirely subjective.",
  art2: "There are good arguments for the claim that Michaelangelo was a good artist.",

  god1: "There is an omnipotent and omnibenevolent god.",
  god2: "If there is a way to prevent the starvation of an innocent child without incuring morally-worse consequences, then it is morally good for the child's starvation to be prevented in that way.",

  know2: "At least some humans know some objective truths.",
  know3: "Each human can have only subjective experiences.",
  know4: "Objective truths cannot be learned through subjective experience.",

  dualism1: "The mind is a partly physical phenomenon.",
  dualism2: "The body is a purely physical phenomenon.",
  dualism3: "The body can be physically influenced by the mind.",
  dualism4: "If a phenomenon is entirely physical, then it cannot be any part mental, and visa versa.",

  tauto1: "If a claim is true, then its negation cannot also be true.",

  util1: "If the morally-relevant consequences of an action are on net good, then that action is a morally good action.",
  util2: "It is morally good to imprison a person and then continuously for 30 years brutally physically and mentally torture them until they die, if doing so is the only way to save 1,000 innocent children from excruciatingly painful and slow deaths.",

  utilAction1: "If an action has overwhelmingly morally-good consequences, then I should take that action.",
  utilAction2: "It is overwhelmingly morally-good for someone like me to donate $10,000 to effectively prevent innocent children from dying.",
  utilAction3: "I should donate $10,000 to charities that effectively prevent thousands of innocent children in Africa from suffering and dying from diseases like Malaria.",

  godKnow1: "A person takes an action freely if it was possible for them to take a different action.",
  godKnow2: "God currently knows every future state of the universe.",
  godKnow3: "Humans sometimes have the ability make free choices.",

  // agnosticism1: "If a person has no logical or empirical evidence for a claim, then it is unreasonable for them to believe that claim.",
  // agnosticism2: ""
}

let keys_questions = [];
for (let key of Object.keys(questions)) keys_questions.push(key)

let contradictions = [
  {
    answers: [{ key: "art1", value: true }, { key: "art2", value: true }],
    description: "If the value of art is entirely subjective, then whether or not Michaelangelo is a good artist cannot be argued between people that did not begin with the same subjective point of view i.e. any pair of people. There must be at least some objective truth to the value of art in order for its quality to be argued."
  },
  {
    answers: [{ key: "god1", value: true }, { key: "god2", value: true }],
    description: "If there is an omnipotent god, then included in omnipotence is the ability to prevent the suffering of the innocent child in question. However, since apparently there are in fact innocent children that suffer in this way, the omnipotent god fails to satisfy omnibenevolence by allowing morally-unoptimal results to come about."
  },
  {
    answers: [{ key: "know2", value: true }, { key: "know3", value: true }, { key: "know4", value: true }],
    description: "If humans can have only subjective experiences, but objective knowledge cannot be gained from subjective experience, then humans can never learn any objective truths. Yet, you agreed that they can. You could resolve this by claiming that some humans \"start out\" with some objective truths and so never have to learn them, but you can't know and so you shouldn't believe it."
  },
  {
    answers: [{ key: "dualism1", value: false }, { key: "dualism2", value: true }, { key: "dualism3", value: true }, { key: "dualism4", value: true }],
    description: "If the body (a purely physical phenomenon) can be influenced by the mind, then it is contradictory to say that the mind is entirely mental (i.e. not partly physical), because it is a defining characteristic of being a (partly) physical phenomenon that it can be physically influenced by other physical phenomena."
  },
  {
    answers: [{ key: "tauto1", value: false }],
    description: "This is the definition of contradiction. If you don't agree with this, then this whole test will probably not be very useful for you..."
  },
  {
    answers: [{ key: "util1", value: true }, { key: "util2", value: false }],
    description: "This is the classic question for utilitarians. You accepted the utilitarian view that the morally-relevant consequences determine the morality of an action, but refused to agree that this general principle applies in an unsavory case."
  },
  {
    answers: [{ key: "utilAction1", value: true }, { key: "utilAction2", value: true }, { key: "utilAction3", value: false }],
    description: "You disagreed that you in particular should take an action that you agreed that people like you should take. But, you are in fact a person like you."
  }
]

function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}