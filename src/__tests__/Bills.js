/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import mockStore from "../__mocks__/store.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import { formatDate } from "../app/format.js"
import Bills from "../containers/Bills.js"

import router from "../app/Router.js";

jest.mock("../app/store", ()=>mockStore)

// unitaire test
describe("Given I am connected as an employee", () => {
  // affichage test
  describe("When I am on Bills page",()=>{
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
      expect(windowIcon.getAttribute("class")).toContain("active-icon");
    })
  })

  describe("when I am on Bills page but it is loading", ()=>{
    test("Then, loading page should be rendered",()=>{
      document.body.innerHTML = BillsUI({loading:true})
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe("When I am on Bills page but back-end send an error message",()=>{
    test("Then, Error page should be rendered",()=>{
      document.body.innerHTML = BillsUI({error:true})
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe("When I am on Bills page, there are bills", ()=>{
    test("Then it should show the button new bill", ()=>{
      document.body.innerHTML = BillsUI({data:bills})
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
    })

    test("Then it should show the bills table", ()=>{
      document.body.innerHTML = BillsUI({data:[bills[0]]})
      expect(screen.getByTestId("tbody")).toBeTruthy()
      expect(screen.getAllByText(bills[0].type)).toBeTruthy()
      expect(screen.getAllByText(bills[0].name)).toBeTruthy()
      expect(screen.getAllByText(bills[0].date)[0].innerHTML).toBe('2004-04-04')
      expect(screen.getAllByText(`${bills[0].amount} €`)).toBeTruthy()
      expect(screen.getAllByText(bills[0].status)).toBeTruthy()
      expect(screen.getByTestId("icon-eye")).toBeTruthy()
    })

    test("Then bills should be ordered from earliest to latest", async () => {
      const billsMock = await mockStore.bills().list();
      const billsDateMock = billsMock.map(a=>a.date).sort((a,b)=> new Date(b)-new Date(a))
      const billsDateMockFormated = billsDateMock.map(a=>formatDate(a))
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = '';
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText('Mes notes de frais'))
      const dates = screen.getAllByText(/^([1-9]|1[0-9]|2[0-9]|3[0-1])\s([a-zA-ZÀ-ÿ]){3}[.]\s(0[1-9]|9[0-9])$/).map(a=>a.innerHTML)
      expect(dates).toEqual(billsDateMockFormated)
    })

  })


  // // fonctionalités

  describe("When I am on Bills page and I click on newBill button",()=>{
    test("Then, the newBill page should be rendered", ()=>{
      document.body.innerHTML=''
      const onNavigate = (pathname) =>{
        document.body.innerHTML = ROUTES({pathname})
      }

      Object.defineProperty(window,'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user',JSON.stringify({
        type: 'Employee'
      }))

      const bill = new Bills({document,onNavigate,store:null,localStorage:window.localStorage})
      document.body.innerHTML = BillsUI({data:bills})

      const handleClickNewBill = jest.fn(()=>bill.handleClickNewBill())
      const btnNewBill = screen.getByTestId('btn-new-bill')
      btnNewBill.addEventListener('click',handleClickNewBill)
      fireEvent.click(btnNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      const newBill = screen.getAllByText('Envoyer une note de frais')
      expect(newBill).toBeTruthy()
    })
  })


  describe("When I am on Bills page and I click on icon-eye", ()=>{
    test("Then, modal should be open", async () => {
      document.body.innerHTML =''
      const onNavigate = (path_name) =>{
        document.body.innerHTML = ROUTES({pathname})
      }
      Object.defineProperty(window,'localStorage',{ value: localStorageMock})
      
      const bill = new Bills({document,onNavigate,store:null,localStorage:window.localStorage})
      document.body.innerHTML = BillsUI({data:bills})

      const icon_eye = screen.getAllByTitle('icon-eye')
      const handleClickIconEye1 = jest.fn(bill.handleClickIconEye(icon_eye[0]))
      icon_eye[0].addEventListener('click',handleClickIconEye1)
      fireEvent.click(icon_eye[0])
      expect(handleClickIconEye1).toHaveBeenCalled()
      const modalFile = screen.getByTestId('modaleFile')
      expect(modalFile).toBeTruthy()

    })
  })

})

// test d'intégration 
// describe("Given I am a user connected as employee", ()=>{
//   describe("When I navigate to Bills page", ()=>{
//   })
// })
