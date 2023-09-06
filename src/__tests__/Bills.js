/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import mockStore from "../__mocks__/store.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import { formatDate, formatStatus } from "../app/format.js"
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
    test("Then it should show the button new bill and the bill table", ()=>{
      document.body.innerHTML = BillsUI({data:bills})
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
      expect(screen.getByTestId("tbody")).toBeTruthy()
      const typeFistBill = screen.getByText('Hôtel et logement') 
      const typeSecondBill = screen.getByText('Transports')
      const typeThirstBill = screen.getByText('Services en ligne')
      const typeFourthBill = screen.getByText('Restaurants et bars')
      const dateFistBill = screen.getByText('2004-04-04') 
      const dateSecondBill = screen.getByText('2001-01-01')
      const dateThirstBill = screen.getByText('2003-03-03')
      const dateFourthBill = screen.getByText('2002-02-02')
      const nameFistBill = screen.getByText('encore') 
      const nameSecondBill = screen.getByText('test1')
      const nameThirstBill = screen.getByText('test3')
      const nameFourthBill = screen.getByText('test2')
      const moneyFistBill = screen.getByText('400 €') 
      const moneySecondBill = screen.getByText('100 €')
      const moneyThirstBill = screen.getByText('300 €')
      const moneyFourthBill = screen.getByText('200 €')
      const pendingBill = screen.getAllByText('pending')
      const acceptedBill = screen.getAllByText('accepted')
      const refusedBill = screen.getAllByText('refused')
      const icon_eyes = screen.getAllByTitle('icon-eye')
      expect(icon_eyes.length).toBe(4)
      expect(pendingBill.length).toBe(1)
      expect(acceptedBill.length).toBe(1)
      expect(refusedBill.length).toBe(2)
      expect(typeFistBill).toBeTruthy()
      expect(typeSecondBill).toBeTruthy()
      expect(typeThirstBill).toBeTruthy()
      expect(typeFourthBill).toBeTruthy()
      expect(nameFistBill).toBeTruthy()
      expect(nameSecondBill).toBeTruthy()
      expect(nameThirstBill).toBeTruthy()
      expect(nameFourthBill).toBeTruthy()
      expect(moneyFistBill).toBeTruthy()
      expect(moneySecondBill).toBeTruthy()
      expect(moneyThirstBill).toBeTruthy()
      expect(moneyFourthBill).toBeTruthy()
      expect(dateFistBill).toBeTruthy()
      expect(dateSecondBill).toBeTruthy()
      expect(dateThirstBill).toBeTruthy()
      expect(dateFourthBill).toBeTruthy()
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
        document.body.innerHTML = ROUTES({path_name})
      }
      Object.defineProperty(window,'localStorage',{ value: localStorageMock})
      window.localStorage.setItem('user',JSON.stringify({
        type: 'Employee'
      }))
      
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

// test d'intégration GET
describe("Given I am a user connected as employee", ()=>{
  describe("When I navigate to Bills page and there is any error", ()=>{
    test("Then fetchs bills from mock API GET", async ()=>{
      document.body.innerHTML=''
      Object.defineProperty(window, 'localStorage', {value:localStorageMock})
      window.localStorage.setItem('user',JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute('id','root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(()=>screen.getAllByText('Mes notes de frais'))
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
      expect(screen.getByTestId("tbody")).toBeTruthy()
      const typeFistBill = screen.getByText('Hôtel et logement') 
      const typeSecondBill = screen.getByText('Transports')
      const typeThirstBill = screen.getByText('Services en ligne')
      const typeFourthBill = screen.getByText('Restaurants et bars')
      const dateFistBill = screen.getByText(formatDate('2004-04-04')) 
      const dateSecondBill = screen.getByText(formatDate('2001-01-01'))
      const dateThirstBill = screen.getByText(formatDate('2003-03-03'))
      const dateFourthBill = screen.getByText(formatDate('2002-02-02'))
      const nameFistBill = screen.getByText('encore') 
      const nameSecondBill = screen.getByText('test1')
      const nameThirstBill = screen.getByText('test3')
      const nameFourthBill = screen.getByText('test2')
      const moneyFistBill = screen.getByText('400 €') 
      const moneySecondBill = screen.getByText('100 €')
      const moneyThirstBill = screen.getByText('300 €')
      const moneyFourthBill = screen.getByText('200 €')
      const pendingBill = screen.getAllByText(formatStatus('pending'))
      const acceptedBill = screen.getAllByText(formatStatus('accepted'))
      const refusedBill = screen.getAllByText(formatStatus('refused'))
      const icon_eyes = screen.getAllByTitle('icon-eye')
      expect(icon_eyes.length).toBe(4)
      expect(pendingBill.length).toBe(1)
      expect(acceptedBill.length).toBe(1)
      expect(refusedBill.length).toBe(2)
      expect(typeFistBill).toBeTruthy()
      expect(typeSecondBill).toBeTruthy()
      expect(typeThirstBill).toBeTruthy()
      expect(typeFourthBill).toBeTruthy()
      expect(nameFistBill).toBeTruthy()
      expect(nameSecondBill).toBeTruthy()
      expect(nameThirstBill).toBeTruthy()
      expect(nameFourthBill).toBeTruthy()
      expect(moneyFistBill).toBeTruthy()
      expect(moneySecondBill).toBeTruthy()
      expect(moneyThirstBill).toBeTruthy()
      expect(moneyFourthBill).toBeTruthy()
      expect(dateFistBill).toBeTruthy()
      expect(dateSecondBill).toBeTruthy()
      expect(dateThirstBill).toBeTruthy()
      expect(dateFourthBill).toBeTruthy()

    })
  })

  describe("When I navigate to Bills page and an error occurs on API", ()=>{
    beforeEach(()=>{
      document.body.innerHTML=''
      jest.spyOn(mockStore,'bills')
      Object.defineProperty(window, 'localStorage', {value:localStorageMock})
      window.localStorage.setItem('user',JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute('id','root')
      document.body.append(root)
      router()
    })
    test('Then fetches bills from an API and fails with 404 message error', async()=>{
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(()=>screen.getAllByText(/Erreur/))
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()

    })

    test('Then fetches bills from an API and fails with 500 message error', async()=>{
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(()=>screen.getAllByText(/Erreur/))
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
