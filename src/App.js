import React from "react";
import { Button, Modal, Navbar, Pagination, Spinner, Table } from "react-bootstrap";
import axios from "axios";

import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      seed: "awesome",
      users: [],
      activeUser: null,
      showModal: false,
      loading: false,
      error: null
    }
  }

  fetchUsers = () => {
    const { page, seed } = this.state;

    return Promise.resolve(this.setState(() => ({users: [], loading: true})))
        .then(() => 
          axios
          .get("https://randomuser.me/api/", { params: {results: 10, page, seed }})
        ).then(({data}) => this.setState({users: data.results, loading: false}))
        .catch(error => this.setState({error}));
  }

  componentDidMount() {
    this.fetchUsers()
  }

  selectUser = (user) => this.setState({activeUser: user, showModal: true}) 
  removeUser = () => this.setState({activeUser: false})
  modalCloseHandler = () => this.setState({showModal: false})

  getNewPage = (page) => { 
    Promise.resolve(this.setState(()=> ({page})))
    .then(this.fetchUsers)
  }

  render () {
    const { page, activeUser, users, showModal, loading, error } = this.state;
    let content = (<Main
        getNewPage={this.getNewPage} 
        modalCloseHandler={this.modalCloseHandler}
        page={page}
        removeUser={this.removeUser}
        selectUser={this.selectUser}
        activeUser={activeUser}
        showModal={showModal}
        users={users}
      />);

    if (loading) {
      content = <Loading />
    }
    
    if (error) {
      content = <Error />
    }
    
    return (
      <>
        <Navbar bg="dark" expand="lg" variant="dark">
          <Navbar.Brand href="#">Random User Inspector</Navbar.Brand>
            <div className="container">
              <div className="d-flex w-100 justify-content-end">
              </div>
            </div>
        </Navbar> 
        <div className="App container">
          {content}
        </div>
      </>
    );
  }
}

function Error () {
  return (
    <div>There was a problem loading content</div>
  );
}

function Loading () {
  return (
    <div className="d-flex align-items-center justify-content-center">
      <Spinner animation="border" size="lg" style={{height: "10rem", width: "10rem", marginTop: "10rem", opacity: 0.5}}/>
    </div>
  );
}

function Main (props) {
  const {getNewPage, page, users, selectUser, activeUser, removeUser, modalCloseHandler, showModal} = props
  return (
    <>
      <Paginator className="mt-3 float-right" size="lg" getNewPage={getNewPage} page={page} />
      <UsersTable users={users} selectUser={selectUser}></UsersTable>
      <UserDetailsModal show={showModal} user={activeUser} closeHandler={modalCloseHandler} onExitHandler={removeUser}/>
    </>
  );
}

function Paginator (props) {
  const { getNewPage, page, className, size} = props;
  const isFirstPage = page === 1;
  return (
    <Pagination className={className} size={size}>
      <Pagination.First className={{"disabled": isFirstPage}} onClick={() => getNewPage(1)}/>
      <Pagination.Prev className={{"disabled": isFirstPage}} onClick={() => getNewPage(page > 1 ? page - 1 : 1)}/>
      <Pagination.Next onClick={() => getNewPage(page + 1)}/>
    </Pagination>  
  );
}

function UsersTable (props) {
  const { users, selectUser} = props;
  const results = users.map(user =>
    <UserRow key={user.login.uuid} user={user} selectUser={selectUser}/>);

  return (
    <>
      <Table size="sm" striped className="mt-3" hover>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Email</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {results}
        </tbody>
      </Table>
    </>
  );
}

function UserRow(props) {
  const { user, selectUser } = props;
  return (
    <tr key={user.login.uuid} onClick={() => selectUser(user)}>
      <td><img src={user.picture.thumbnail} alt="" style={{minHeight: "48px", minWidth: "48px"}} /></td>
      <td>{user.name.first} {user.name.last}</td>
      <td>{user.email}</td>
      <td>{user.location.country}</td>
    </tr>
  );
}

function UserDetailsModal (props) {
  const { show, closeHandler, onExitedHandler, user } = props;
  let modalBody = <></>;

  if (user) {
    modalBody = (
      <div className="media">
        <img src={user.picture.large} className="mr-5 ml-2" style={{minHeight: "128px", minWidth: "128px"}} alt="..." />
        <div className="media-body">
          <h5 className="mt-0">{user.name.title} {user.name.first} {user.name.last}</h5>
          <ul style={{listStyleType: "none", margin: 0, padding: 0}}>
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>Mobile:</strong> {user.cell}</li>
            <li>
              <strong>Location:</strong>
              {locationInfo(user.location)}
            </li>
          </ul>
        </div>
      </div>
    )
  } 
  return (
    <Modal show={show} size="lg" onExited={onExitedHandler}>
        <Modal.Body>
        </Modal.Body>
          {modalBody}
        <Modal.Footer>
          <Button variant="secondary" onClick={closeHandler}>Close</Button>
        </Modal.Footer>
    </Modal>
  );
}

function locationInfo(location) {
  const {street: {number, name}, city, state, country, postalcode } = location;

  return (
    <>
      <p className="my-0">{[number, name].join(" ")}</p>
      <p className="my-0">{[city, state, country, postalcode].filter(a => a).join(", ")}</p>
    </>
  );
}

export default App;
