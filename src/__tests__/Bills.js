/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

// unitaire test
describe("Given I am connected as an employee", () => {
  // affichage test
  describle("When I am on Bills page",()=>{
    test("Then bill icon in vertical layout should be highlighted", async ()=>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
    })
  })

  describe("when I am on Bills page but it is loading", ()=>{
    test("Then, loading page should be rendered",()=>{
    })
  })

  describe("When I am on Bills page but back-end send an error message",()=>{
    test("Then, Error page should be rendered",()=>{
    })
  })

  describe("When I am on Bills Page, there are bills", ()=>{
    test("Then, it should show table of bills",()=>{
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })


  // fonctionalités

  describe("When I am on Bills page and I click on icon-eye", ()=>{
    test("Then, modal should be open, and justification should be appear", async () => {
    })
  })

  describe("When I am on Bills page and I click on newBill button",()=>{
    test("Then, the newBill page should be rendered", ()=>{

    })
  })

  // describe("When I am on Bills Page", () => {
  //   test("Then bill icon in vertical layout should be highlighted", async () => {

  //     Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  //     window.localStorage.setItem('user', JSON.stringify({
  //       type: 'Employee'
  //     }))
  //     const root = document.createElement("div")
  //     root.setAttribute("id", "root")
  //     document.body.append(root)
  //     router()
  //     window.onNavigate(ROUTES_PATH.Bills)
  //     await waitFor(() => screen.getByTestId('icon-window'))
  //     const windowIcon = screen.getByTestId('icon-window')
  //     //to-do write expect expression

  //   })
  //   test("Then bills should be ordered from earliest to latest", () => {
  //     document.body.innerHTML = BillsUI({ data: bills })
  //     const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
  //     const antiChrono = (a, b) => ((a < b) ? 1 : -1)
  //     const datesSorted = [...dates].sort(antiChrono)
  //     expect(dates).toEqual(datesSorted)
  //   })
  // })

})

// test d'intégration 
describe("Given I am a user connected as employee", ()=>{
  describe("When I navigate to Bills page", ()=>{
  })
})
