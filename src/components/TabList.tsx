import { useEffect, useState } from 'react';

import { knownWorlds } from '../constants';
import { useVoxelize } from '../hooks/useVoxelverses';
import { getCoreUrl } from '../utils/urls';

import { ColorText } from '@/src/components/ColorText';

const worldNameToActualName = {
  main: 'Main',
  flat: 'V1 Alpha',
  flat2: "Builder's Wonderland (new)",
};

type ClientData = Record<string, { id: string; username: string }[]>;

export function TabList() {
  const [shouldDisplayTabList, setShouldDisplayTabList] = useState(false);
  const [clientData, setClientData] = useState<ClientData>({});
  const [isLoading, setIsLoading] = useState(false);
  const { worldName, network } = useVoxelize();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await fetch(`${getCoreUrl()}/info`);
      const data = await response.json();
      const newClientData: ClientData = {};
      Object.entries(data.worlds).forEach(([worldName, worldData]: any) => {
        newClientData[worldName] = worldData.clients;
      });
      setClientData(newClientData);
      setIsLoading(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();

      if (shouldDisplayTabList) return;

      setShouldDisplayTabList(true);
      fetchData();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setShouldDisplayTabList(false);
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [shouldDisplayTabList]);

  return (
    <>
      {shouldDisplayTabList && clientData && (
        <div className="fixed bottom-0 left-0 m-3 bg-overlay rounded border-[2px] border-solid border-text-primary max-w-[450px]">
          <div className="text-sm border-b-[2px] border-solid border-text-secondary border-x-0 border-t-0 p-1.5 text-cyan-400 italic">
            hi.shaoruu.io{' '}
            <span className="opacity-50">
              (
              {Object.values(clientData).reduce(
                (acc, curr) => acc + curr.length,
                0,
              )}
              )
            </span>
          </div>
          <div className="flex justify-center flex-col align-middle w-full">
            {!isLoading ? (
              Object.entries(clientData)
                .sort((a, b) => {
                  if (a[0] === worldName) return -1;
                  if (b[0] === worldName) return 1;
                  const aIndex = knownWorlds.indexOf(a[0]);
                  const bIndex = knownWorlds.indexOf(b[0]);
                  return aIndex - bIndex;
                })
                .map(([worldName, clients]) => {
                  return (
                    <div
                      className="flex flex-col gap-1.5 px-0.5 py-1.5 last:border-b-0 border-b-[2px] border-solid border-text-secondary border-x-0 border-t-0 w-full"
                      key={worldName}
                    >
                      <div className="text-[#ECCA9C] w-full px-1 py-0.5 font-bold text-xs">
                        {worldNameToActualName[worldName]}{' '}
                        <span className="opacity-50">({clients.length})</span>
                      </div>
                      <div className="flex flex-col gap-1 pl-1.5 border-l-[2px] border-solid border-text-primary border-y-0 border-r-0 w-full flex-wrap">
                        {clients.length > 0 ? (
                          clients.map((client) => (
                            <div key={client.id}>
                              <ColorText>{client.username}</ColorText>
                              {client.username.includes(
                                network?.clientInfo.username ?? '',
                              ) && (
                                <span className="text-purple-600 ml-1 opacity-75">
                                  (You)
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-white opacity-50">
                            No players
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
            ) : (
              <span className="text-white opacity-50">Loading...</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
