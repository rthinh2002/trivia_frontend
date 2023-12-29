import React, { Component } from 'react';
import '../stylesheets/App.css';
import Question from './Question';
import Search from './Search';
import $ from 'jquery';

class QuestionView extends Component {
  constructor() {
    super();
    this.state = {
      allQuestions: [],
      questions: [],
      page: 1,
      totalQuestions: 0,
      categories: {},
      currentCategory: '',
    };
  }

  componentDidMount() {
    this.getQuestions();
  }

  getQuestions = () => {
    const questionPromise = $.ajax({
      url: `/api/Questions`, // TODO: Update request URL
      type: 'GET'
    });

    const categoryPromise = $.ajax({
      url: `/api/Categories`, 
      type: 'GET'
    });

    Promise.all([questionPromise, categoryPromise])
      .then(([questionsResult, categoriesResult]) => {
        this.setState({
          allQuestions: questionsResult,
          totalQuestions: Object.keys(questionsResult).length,
          categories: categoriesResult 
        });
        this.sliceQuestion();
      })
      .catch((error) => {
        console.log(error);
        alert('Unable to load questions or categories. Please try your request again');
      });
  };

  selectPage(num) {
    this.setState({ page: num }, () => {
      this.sliceQuestion();
    });
  }

  sliceQuestion() {
    const startIndex = (this.state.page - 1) * 10;
    const endIndex = startIndex + 10;
    this.setState({ questions: this.state.allQuestions.slice(startIndex, endIndex) });
  }

  createPagination() {
    let pageNumbers = [];
    let maxPage = Math.ceil(this.state.totalQuestions / 10);
    for (let i = 1; i <= maxPage; i++) {
      pageNumbers.push(
        <span
          key={i}
          className={`page-num ${i === this.state.page ? 'active' : ''}`}
          onClick={() => {
            this.selectPage(i);
          }}
        >
          {i}
        </span>
      );
    }
    return pageNumbers;
  }

  getByCategory = (id) => {
    $.ajax({
      url: `/api/Questions/categories?categoryId=${id}`, //TODO: update request URL
      type: 'GET',
      success: (result) => {
        this.setState({
          allQuestions: result,
          totalQuestions: Object.keys(result).length,
          currentCategory: result.current_category,
        });
        this.sliceQuestion();
        return;
      },
      error: (error) => {
        alert('Unable to load questions. Please try your request again');
        return;
      },
    });
  };

  submitSearch = (searchTerm) => {
    $.ajax({
      url: `/api/Questions/search`, //TODO: update request URL
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(searchTerm),
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: (result) => {
        this.setState({
          allQuestions: result,
          totalQuestions: Object.keys(result).length,
          currentCategory: result.current_category,
        });
        this.sliceQuestion();
        return;
      },
      error: (error) => {
        alert('Unable to load questions. Please try your request again');
        return;
      },
    });
  };

  questionAction = (id) => (action) => {
    if (action === 'DELETE') {
      if (window.confirm('are you sure you want to delete the question?')) {
        $.ajax({
          url: `/api/Questions/delete?questionId=${id}`, //TODO: update request URL
          type: 'DELETE',
          success: (result) => {
            this.getQuestions();
          },
          error: (error) => {
            alert('Unable to load questions. Please try your request again');
            return;
          },
        });
      }
    }
  };

  render() {
    return (
      <div className='question-view'>
        <div className='categories-list'>
          <h2
            onClick={() => {
              this.getQuestions();
            }}
          >
            Categories
          </h2>
          <ul>
            {Object.keys(this.state.categories).map((id) => (
              <li
                key={parseInt(id) + 1}
                onClick={() => {
                  this.getByCategory(parseInt(id) + 1);
                }}
              >
                {this.state.categories[id].type}
                <img
                  className='category'
                  alt={`${(this.state.categories[id].type).toLowerCase()}`}
                  src={`${(this.state.categories[id].type).toLowerCase()}.svg`}
                />
              </li>
            ))}
          </ul>
          <Search submitSearch={this.submitSearch} />
        </div>
        <div className='questions-list'>
          <h2>Questions</h2>
          {this.state.categories && (
            this.state.questions.map((q, ind) => (
              <Question
                key={q.id}
                question={q.questionText}
                answer={q.answer}
                category={this.state.categories[q.categoryId - 1]}
                difficulty={q.difficulty}
                questionAction={this.questionAction(q.id)}
              />
            ))
          )}
          <div className='pagination-menu'>{this.createPagination()}</div>
        </div>
      </div>
    );
  }
}

export default QuestionView;
